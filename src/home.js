import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Radio, notification, Layout, Typography, Space, Input, List, Tag, Select, message } from 'antd';
import Papa from 'papaparse';
import './home.css'

const { Content } = Layout;
const { Text } = Typography;

function Home() {
  const [selectedPathology, setSelectedPathology] = useState('');
  const [pathologyData, setPathologyData] = useState([]);
  const [selectedSide, setSelectedSide] = useState([]);
  const [selectedLobe, setSelectedLobe] = useState([]);
  const [selectedMm, setSelectedMm] = useState([]);
  const [selectedPathologies, setSelectedPathologies] = useState([]);
  const [observations, setObservations] = useState([]);
  const [impressions, setImpressions] = useState([]);
  const [step, setStep] = useState(1); // Step-wise flow for Pathology → Side → Lobe → MM
  const [searchTerm, setSearchTerm] = useState(''); // Define the searchTerm state
  const [report, setReport] = useState(''); // Store the generated report
  const [messageApi, contextHolder] = message.useMessage();

  // Load CSV data from public directory
  useEffect(() => {
    fetch('./mahesh.csv')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.text();
      })
      .then((csvText) => {
        Papa.parse(csvText, {
          complete: (result) => {
            setPathologyData(result.data);
          },
          header: true, // Assumes the first row in CSV is the header
        });
      })
      .catch((error) => {
        notification.error({
          message: "Error",
          description: "Failed to load CSV data.",
        });
      });
  }, []);

  // Handle pathology change from radio buttons
  const handlePathologyChange = (e) => {
    setSelectedPathology(e.target.value);
    setStep(2); // Move to Step 2 (Side selection)
    const pathologyInfo = pathologyData.find(p => p.Pathology === e.target.value);
    if (pathologyInfo) {
      setSelectedSide(pathologyInfo.is_side === 'TRUE' ? [] : []);
      setSelectedLobe(pathologyInfo.is_lobe === 'TRUE' ? [] : []);
      setSelectedMm(pathologyInfo.is_mm === 'TRUE' ? [] : []);
    }
  };

  // Handle side selection
  const handleSideChange = (values) => {
    setSelectedSide(values);
    setStep(3); // Move to Step 3 (Lobe selection)
  };

  // Handle lobe selection
  const handleLobeChange = (values) => {
    setSelectedLobe(values);
    setStep(4); // Move to Step 4 (MM selection)
  };

  // Handle mm selection
  const handleMmChange = (values) => {
    setSelectedMm(values);
  };

  // Add selected pathology to the selected list
  const handleAddPathology = () => {
    const pathologyInfo = pathologyData.find(p => p.Pathology === selectedPathology);
    
    if (pathologyInfo) {
      const { Observation, Impression, is_side, is_lobe, is_mm } = pathologyInfo;
  
      // If required fields are missing, show warning and prevent adding
      if (
        (is_side === 'TRUE' && selectedSide.length === 0) ||
        (is_lobe === 'TRUE' && selectedLobe.length === 0) ||
        (is_mm === 'TRUE' && selectedMm.length === 0)
      ) {
        message.warning('This pathology requires additional information like side, lobe, and measurement. Please provide them before adding.');
        return;
      }
  
      // Add pathology to the selected list
      setSelectedPathologies([...selectedPathologies, selectedPathology]);
      setObservations([...observations, Observation]);
      setImpressions([...impressions, Impression]);
  
      // Reset for next pathology
      setSelectedPathology('');
      setSelectedSide([]);
      setSelectedLobe([]);
      setSelectedMm([]);
      setStep(1); // Go back to Step 1 (Pathology selection)
    }
  };

  // Remove pathology from the selected list
  const handleRemovePathology = (pathologyToRemove) => {
    const index = selectedPathologies.indexOf(pathologyToRemove);
    setSelectedPathologies(selectedPathologies.filter((_, i) => i !== index));
    setObservations(observations.filter((_, i) => i !== index));
    setImpressions(impressions.filter((_, i) => i !== index));
  };

  // Clear all selected pathologies
  const handleClearAll = () => {
    setSelectedPathologies([]);
    setObservations([]);
    setImpressions([]);
    setSelectedSide([]);
    setSelectedLobe([]);
    setSelectedMm([]);
    setStep(1); // Go back to Step 1
  };

  // Report generation: Compile selected pathologies into a report
  const handleGenerateReport = () => {
    // Create formatted observations and impressions with bullet points
    const observationsList = selectedPathologies.map((pathology, index) => {
      return `- ${observations[index]}`; // Add bullet points to each observation
    }).join("\n");
  
    const impressionsList = selectedPathologies.map((pathology, index) => {
      return `- ${impressions[index]}`; // Add bullet points to each impression
    }).join("\n");
  
    // Combine the observations and impressions into the report content
    const reportContent = `
      Observation:
      ${observationsList}
  
      Impression:
      ${impressionsList}
    `;
  
    // Set the generated report to state
    setReport(reportContent);
  };

  return (
    <Layout>
      <Content className="layout-content">
        <Row gutter={16}>
          {/* Left Column: Step-wise Pathology selection */}
          <Col span={6} className="left-column">
            <Card title="Select Pathologies">
              <Space direction="vertical" style={{ width: '100%' }}>
                {/* Sticky Search Bar */}
                <div className="sticky-search">
                  <Input
                    placeholder="Search Pathologies"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    disabled={step !== 1}
                  />
                </div>

                {/* List of Pathologies */}
                <div className="path">
                  <List
                    dataSource={pathologyData.filter((pathology) =>
                      pathology.Pathology.toLowerCase().includes(searchTerm.toLowerCase())
                    )}
                    renderItem={(pathology) => (
                      <List.Item>
                        <Radio
                          value={pathology.Pathology}
                          onChange={handlePathologyChange}
                          disabled={step !== 1}
                        >
                          {pathology.Pathology}
                        </Radio>
                      </List.Item>
                    )}
                  />
                </div>
              </Space>
            </Card>
          </Col>

          {/* Second Column: Manage Pathologies */}
          <Col span={5} className="manage-pathologies">
            <Card title="Select Side">
              <Select
                mode="multiple"
                value={selectedSide}
                options={['Left', 'Right'].map((value) => ({ value }))}
                onChange={handleSideChange}
                style={{ width: '100%' }}
                disabled={step !== 2}
              />
            </Card>

            <Card title="Select Lobe">
              <Select
                mode="multiple"
                value={selectedLobe}
                options={['Frontal', 'Temporal', 'Parietal', 'Occipital'].map((value) => ({ value }))}
                onChange={handleLobeChange}
                style={{ width: '100%' }}
                disabled={step !== 3}
              />
            </Card>

            <Card title="Select MM">
              <Select
                mode="multiple"
                value={selectedMm}
                options={['< 1 mm', '1-3 mm', '> 3 mm'].map((value) => ({ value }))}
                onChange={handleMmChange}
                style={{ width: '100%' }}
                disabled={step !== 4}
              />
            </Card>

            {/* Selected Pathologies */}
            <Card title="Selected Pathologies" className="selected-pathologies">
              {selectedPathologies.map((pathology, index) => (
                <Tag
                  key={index}
                  color="blue"
                  closable
                  onClose={() => handleRemovePathology(pathology)}
                >
                  {pathology}
                </Tag>
              ))}
            </Card>

            {/* Add Pathology Button */}
            <Button
              type="primary"
              onClick={handleAddPathology}
              style={{ width: '100%' }}
            >
              Add Pathology
            </Button>

            {/* Clear All Button */}
            <Button
              type="danger"
              onClick={handleClearAll}
              style={{ width: '100%', marginTop: '10px' }}
            >
              Clear All
            </Button>
          </Col>

          {/* Right Column: Report Section */}
          <Col span={13} className="report-column" style={{ position: 'relative', maxHeight: '100vh' }}>
            <Row gutter={16}>
              {/* Observation Section */}
              <Col span={24}>
                <Card title="Observation" className="generated-report" style={{ height: '200px', overflowY: 'auto' }}>
                  <pre>{report}</pre>
                </Card>
              </Col>

              {/* Impression Section */}
              <Col span={24}>
                <Card title="Impression" className="generated-report" style={{ height: '200px', overflowY: 'auto' }}>
                  <pre>{report}</pre>
                </Card>
              </Col>

              {/* Advice Section */}
              <Col span={24}>
                <Card title="Advice" className="generated-report" style={{ height: '200px', overflowY: 'auto' }}>
                  <pre>{report}</pre>
                </Card>
              </Col>

              {/* Generate Report Button */}
              <Col span={24}>
                <Button
                  type="primary"
                  onClick={handleGenerateReport}
                  style={{ width: '100%' }}
                >
                  Generate Report
                </Button>
              </Col>
            </Row>
          </Col>
        </Row>
      </Content>
      {contextHolder}
    </Layout>
  );
}


export default Home;
