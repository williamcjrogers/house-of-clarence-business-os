import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  Target, 
  DollarSign, 
  Users, 
  Building, 
  Brain,
  LineChart,
  PieChart,
  BarChart3,
  Calendar,
  CheckCircle,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Lightbulb,
  Zap,
  Search,
  Filter,
  Edit3,
  Save,
  X,
  Database,
  Calculator,
  TrendingDown,
  Plus
} from 'lucide-react';

const StrategyAnalysis = () => {
  // Analysis and query state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [editingMetric, setEditingMetric] = useState(null);
  const [queryResults, setQueryResults] = useState([]);
  const [analysisMode, setAnalysisMode] = useState('query');
  const [customScenario, setCustomScenario] = useState({
    revenueGrowth: 0,
    conversionImprovement: 0,
    costReduction: 0
  });

  // Editable Business Metrics
  const [currentMetrics, setCurrentMetrics] = useState({
    monthsOperating: 4,
    projectsSecured: 9,
    currentTurnover: 917000,
    pendingProjects: 4,
    pendingValue: 375000,
    pipelineProjects: 18,
    pipelineValue: 1475000,
    profitMargin: 26.5,
    conversionRate: 24,
    monthlyBurnRate: 59000
  });

  // Editable Market Data
  const [marketData, setMarketData] = useState({
    ukSecondFixMarket: 9600000000,
    premiumSegment: 25,
    targetableMarket: 2400000000,
    currentMarketShare: 0.00038,
    projectedShare: 0.001,
    growthRate: 8.5
  });

  // Dynamic Financial Projections (recalculated based on inputs)
  const projections = useMemo(() => {
    const baseRevenue = currentMetrics.currentTurnover;
    const baseProjects = currentMetrics.projectsSecured;
    const growthMultiplier = 1 + (currentMetrics.conversionRate / 100);
    
    return {
      month6: { 
        revenue: Math.round(baseRevenue * 1.6), 
        profit: Math.round(baseRevenue * 1.6 * currentMetrics.profitMargin / 100), 
        projects: Math.round(baseProjects * 1.3) 
      },
      year1: { 
        revenue: Math.round(baseRevenue * 3.5 * growthMultiplier), 
        profit: Math.round(baseRevenue * 3.5 * growthMultiplier * currentMetrics.profitMargin / 100), 
        projects: Math.round(baseProjects * 3.1) 
      },
      year2: { 
        revenue: Math.round(baseRevenue * 8.2 * growthMultiplier), 
        profit: Math.round(baseRevenue * 8.2 * growthMultiplier * currentMetrics.profitMargin / 100), 
        projects: Math.round(baseProjects * 7.2) 
      },
      year3: { 
        revenue: Math.round(baseRevenue * 16.4 * growthMultiplier), 
        profit: Math.round(baseRevenue * 16.4 * growthMultiplier * currentMetrics.profitMargin / 100), 
        projects: Math.round(baseProjects * 13.9) 
      }
    };
  }, [currentMetrics]);

  // Data Analysis Functions
  const analyzeMetric = (metricName) => {
    const metric = currentMetrics[metricName];
    const analyses = [];
    
    if (metricName === 'conversionRate') {
      if (metric > 20) analyses.push({ type: 'positive', message: `Above industry average (15-18%). Strong competitive position.` });
      if (metric < 15) analyses.push({ type: 'warning', message: 'Below industry standard. Requires optimization.' });
      const potentialProjects = Math.round((metric * currentMetrics.pipelineProjects) / 100);
      analyses.push({ type: 'insight', message: `Pipeline Impact: ${potentialProjects} projects likely from current £${(currentMetrics.pipelineValue/1000).toFixed(0)}K pipeline` });
      
      // Revenue impact analysis
      const revenuePerProject = currentMetrics.currentTurnover / currentMetrics.projectsSecured;
      const potentialRevenue = potentialProjects * revenuePerProject;
      analyses.push({ type: 'projection', message: `Potential Revenue: £${(potentialRevenue/1000).toFixed(0)}K from pipeline conversion` });
    }
    
    if (metricName === 'profitMargin') {
      if (metric > 25) analyses.push({ type: 'positive', message: 'Strong profitability margins indicate healthy pricing strategy' });
      if (metric < 20) analyses.push({ type: 'warning', message: 'Margins below industry premium standard (20-30%)' });
      const annualProfit = currentMetrics.currentTurnover * (metric/100) * 3.5;
      analyses.push({ type: 'projection', message: `Annual Profit Potential: £${Math.round(annualProfit/1000)}K based on current trajectory` });
    }
    
    if (metricName === 'currentTurnover') {
      const monthlyRun = metric / currentMetrics.monthsOperating;
      const annualRun = monthlyRun * 12;
      analyses.push({ type: 'trend', message: `Current Run Rate: £${(monthlyRun/1000).toFixed(0)}K/month (£${(annualRun/1000).toFixed(0)}K annually)` });
      
      // Market share analysis
      const marketShare = (metric / marketData.targetableMarket) * 100;
      analyses.push({ type: 'market', message: `Market Share: ${marketShare.toFixed(4)}% of £${(marketData.targetableMarket/1000000000).toFixed(1)}B premium segment` });
    }
    
    if (metricName === 'pipelineValue') {
      const conversionPotential = (currentMetrics.conversionRate / 100) * metric;
      const timeToConvert = currentMetrics.pipelineProjects / (currentMetrics.projectsSecured / currentMetrics.monthsOperating);
      analyses.push({ type: 'potential', message: `Expected Conversion: £${(conversionPotential/1000).toFixed(0)}K over ${timeToConvert.toFixed(1)} months` });
    }
    
    return analyses;
  };

  const queryBusinessData = (query) => {
    const results = [];
    const queryLower = query.toLowerCase();
    
    // Advanced search through all data
    if (queryLower.includes('revenue') || queryLower.includes('turnover')) {
      results.push({
        type: 'metric',
        key: 'currentTurnover',
        value: currentMetrics.currentTurnover,
        analysis: analyzeMetric('currentTurnover')
      });
      
      // Add projection data
      results.push({
        type: 'projection',
        key: 'year1Revenue',
        value: projections.year1.revenue,
        context: 'Year 1 revenue projection based on current metrics'
      });
    }
    
    if (queryLower.includes('conversion') || queryLower.includes('win rate')) {
      results.push({
        type: 'metric',
        key: 'conversionRate',
        value: currentMetrics.conversionRate,
        analysis: analyzeMetric('conversionRate')
      });
    }
    
    if (queryLower.includes('profit') || queryLower.includes('margin')) {
      results.push({
        type: 'metric',
        key: 'profitMargin',
        value: currentMetrics.profitMargin,
        analysis: analyzeMetric('profitMargin')
      });
    }
    
    if (queryLower.includes('market') || queryLower.includes('opportunity')) {
      results.push({
        type: 'market',
        key: 'marketOpportunity',
        value: marketData.targetableMarket,
        context: `£${(marketData.targetableMarket/1000000000).toFixed(1)}B addressable premium segment, growing at ${marketData.growthRate}% annually`
      });
    }
    
    if (queryLower.includes('pipeline')) {
      results.push({
        type: 'metric',
        key: 'pipelineValue',
        value: currentMetrics.pipelineValue,
        analysis: analyzeMetric('pipelineValue')
      });
    }
    
    // Growth potential queries
    if (queryLower.includes('growth') || queryLower.includes('potential')) {
      const currentRunRate = (currentMetrics.currentTurnover / currentMetrics.monthsOperating) * 12;
      const year1Target = projections.year1.revenue;
      const growthMultiple = year1Target / currentRunRate;
      
      results.push({
        type: 'analysis',
        key: 'growthPotential',
        value: growthMultiple,
        context: `${growthMultiple.toFixed(1)}x revenue growth potential from current run rate to Year 1 target`
      });
    }
    
    setQueryResults(results);
  };

  const updateMetric = (category, key, newValue) => {
    const numValue = parseFloat(newValue) || 0;
    
    if (category === 'current') {
      setCurrentMetrics(prev => ({ ...prev, [key]: numValue }));
    } else if (category === 'market') {
      setMarketData(prev => ({ ...prev, [key]: numValue }));
    }
    setEditingMetric(null);
  };

  const runScenarioAnalysis = () => {
    const baseRevenue = currentMetrics.currentTurnover;
    const scenarioRevenue = baseRevenue * (1 + customScenario.revenueGrowth / 100);
    const scenarioConversion = currentMetrics.conversionRate * (1 + customScenario.conversionImprovement / 100);
    const scenarioProfit = (scenarioRevenue * currentMetrics.profitMargin / 100) * (1 + customScenario.costReduction / 100);
    const baseProfit = baseRevenue * currentMetrics.profitMargin / 100;
    
    return {
      revenue: scenarioRevenue,
      conversion: Math.min(scenarioConversion, 45), // Cap at realistic maximum
      profit: scenarioProfit,
      impact: {
        revenueChange: ((scenarioRevenue - baseRevenue) / baseRevenue) * 100,
        profitChange: ((scenarioProfit - baseProfit) / baseProfit) * 100,
        projectsImpact: Math.round((scenarioConversion / 100) * currentMetrics.pipelineProjects)
      }
    };
  };

  useEffect(() => {
    if (searchQuery.length > 2) {
      queryBusinessData(searchQuery);
    } else {
      setQueryResults([]);
    }
  }, [searchQuery, currentMetrics, marketData, projections]);

  const MetricEditor = ({ category, metricKey, currentValue, label, unit = '', format = 'number' }) => {
    const [editValue, setEditValue] = useState(currentValue);
    const isEditing = editingMetric === `${category}-${metricKey}`;
    
    const formatValue = (value) => {
      if (format === 'currency') return `£${(value/1000).toFixed(0)}K`;
      if (format === 'percentage') return `${value}%`;
      if (format === 'number') return typeof value === 'number' ? value.toLocaleString() : value;
      return value;
    };
    
    if (!isEditing) {
      return (
        <div className="flex justify-between items-center p-3 hover:bg-gray-50 rounded cursor-pointer border-b border-gray-100"
             onClick={() => setEditingMetric(`${category}-${metricKey}`)}>\n          <span className="text-sm font-medium text-gray-700">{label}</span>
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-900">{formatValue(currentValue)}{unit}</span>
            <Edit3 className="h-4 w-4 text-gray-400 hover:text-blue-600" />
          </div>
        </div>
      );
    }
    
    return (
      <div className="flex justify-between items-center p-3 bg-blue-50 rounded border-2 border-blue-200">
        <span className="text-sm font-medium text-blue-900">{label}</span>
        <div className="flex items-center gap-2">
          <Input 
            type="number" 
            value={editValue} 
            onChange={(e) => setEditValue(e.target.value)}
            className="w-32 h-8 text-sm"
            placeholder="Enter new value"
          />
          <Button size="sm" onClick={() => updateMetric(category, metricKey, editValue)} className="h-8">
            <Save className="h-3 w-3" />
          </Button>
          <Button size="sm" variant="outline" onClick={() => setEditingMetric(null)} className="h-8">
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header with Search */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Business Strategy & Analysis Center</h1>
            <p className="text-gray-600 mt-2">Query, analyze, and modify your business data in real-time</p>
          </div>
          <Badge className="bg-blue-100 text-blue-800 px-3 py-1">
            Live Data Analysis
          </Badge>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex gap-4 items-center p-4 bg-gray-50 rounded-lg">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Query your business data (e.g., 'revenue growth', 'conversion rate', 'market opportunity')..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2"
            />
          </div>
          <Select value={analysisMode} onValueChange={setAnalysisMode}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="query">Query Mode</SelectItem>
              <SelectItem value="edit">Edit Mode</SelectItem>
              <SelectItem value="scenario">Scenario Analysis</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="query" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="query">Data Query & Analysis</TabsTrigger>
          <TabsTrigger value="edit">Edit Business Data</TabsTrigger>
          <TabsTrigger value="scenario">Scenario Modeling</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        {/* Query & Analysis Tab */}
        <TabsContent value="query" className="space-y-6">
          {queryResults.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Query Your Business Data</h3>
                <p className="text-gray-600 mb-4">
                  Type queries like "revenue", "conversion rate", "market opportunity", "growth potential" to analyze your data
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {['revenue analysis', 'conversion rate', 'profit margins', 'market share', 'pipeline value', 'growth potential'].map(suggestion => (
                    <Button 
                      key={suggestion}
                      variant="outline" 
                      size="sm" 
                      onClick={() => setSearchQuery(suggestion)}
                      className="text-xs"
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-lg font-semibold">Query Results for: "{searchQuery}"</h3>
                <Badge variant="secondary">{queryResults.length} results</Badge>
              </div>
              
              {queryResults.map((result, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-semibold text-lg capitalize">{result.key.replace(/([A-Z])/g, ' $1')}</h4>
                        <Badge className={`mt-2 ${
                          result.type === 'metric' ? 'bg-blue-100 text-blue-800' : 
                          result.type === 'market' ? 'bg-green-100 text-green-800' : 
                          result.type === 'projection' ? 'bg-purple-100 text-purple-800' : 
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {result.type}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">
                          {typeof result.value === 'number' ? 
                            result.key.includes('Revenue') || result.key.includes('Turnover') || result.key.includes('Value') ? 
                            `£${(result.value / 1000).toFixed(0)}K` :
                            result.key.includes('Rate') || result.key.includes('Margin') ?
                            `${result.value}%` :
                            result.value.toLocaleString() : 
                            result.value
                          }
                        </div>
                      </div>
                    </div>
                    
                    {result.context && (
                      <p className="text-gray-600 mb-3">{result.context}</p>
                    )}
                    
                    {result.analysis && result.analysis.length > 0 && (
                      <div className="space-y-2">
                        <h5 className="font-medium text-gray-900">Analysis:</h5>
                        {result.analysis.map((analysis, i) => (
                          <div key={i} className={`p-3 rounded-lg border-l-4 ${
                            analysis.type === 'positive' ? 'bg-green-50 border-green-400' :
                            analysis.type === 'warning' ? 'bg-yellow-50 border-yellow-400' :
                            analysis.type === 'insight' ? 'bg-blue-50 border-blue-400' :
                            'bg-gray-50 border-gray-400'
                          }`}>
                            <div className="flex items-center gap-2">
                              {analysis.type === 'positive' && <CheckCircle className="h-4 w-4 text-green-600" />}
                              {analysis.type === 'warning' && <AlertCircle className="h-4 w-4 text-yellow-600" />}
                              {analysis.type === 'insight' && <Lightbulb className="h-4 w-4 text-blue-600" />}
                              <span className="text-sm font-medium capitalize">{analysis.type}</span>
                            </div>
                            <p className="text-sm mt-1 text-gray-700">{analysis.message}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Edit Data Tab */}
        <TabsContent value="edit" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Edit3 className="h-5 w-5" />
                  Current Business Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <MetricEditor category="current" metricKey="currentTurnover" currentValue={currentMetrics.currentTurnover} label="Current Turnover" format="currency" />
                <MetricEditor category="current" metricKey="projectsSecured" currentValue={currentMetrics.projectsSecured} label="Projects Secured" />
                <MetricEditor category="current" metricKey="conversionRate" currentValue={currentMetrics.conversionRate} label="Conversion Rate" unit="%" />
                <MetricEditor category="current" metricKey="profitMargin" currentValue={currentMetrics.profitMargin} label="Profit Margin" unit="%" />
                <MetricEditor category="current" metricKey="pipelineValue" currentValue={currentMetrics.pipelineValue} label="Pipeline Value" format="currency" />
                <MetricEditor category="current" metricKey="pipelineProjects" currentValue={currentMetrics.pipelineProjects} label="Pipeline Projects" />
                <MetricEditor category="current" metricKey="monthlyBurnRate" currentValue={currentMetrics.monthlyBurnRate} label="Monthly Burn Rate" format="currency" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Market Data
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <MetricEditor category="market" metricKey="ukSecondFixMarket" currentValue={marketData.ukSecondFixMarket} label="UK Second Fix Market" format="currency" />
                <MetricEditor category="market" metricKey="targetableMarket" currentValue={marketData.targetableMarket} label="Targetable Premium Segment" format="currency" />
                <MetricEditor category="market" metricKey="growthRate" currentValue={marketData.growthRate} label="Market Growth Rate" unit="%" />
                <MetricEditor category="market" metricKey="premiumSegment" currentValue={marketData.premiumSegment} label="Premium Segment Share" unit="%" />
              </CardContent>
            </Card>
          </div>

          {/* Live Projections Update */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Live Updated Projections
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {Object.entries(projections).map(([period, data]) => (
                  <div key={period} className="text-center p-4 border rounded-lg">
                    <div className="text-lg font-bold text-gray-900">{period.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</div>
                    <div className="text-2xl font-bold text-blue-600 mt-2">£{(data.revenue / 1000).toFixed(0)}K</div>
                    <div className="text-sm text-gray-600">Revenue</div>
                    <div className="text-lg font-semibold text-green-600 mt-2">£{(data.profit / 1000).toFixed(0)}K</div>
                    <div className="text-sm text-gray-600">Profit</div>
                    <div className="text-lg font-semibold text-purple-600 mt-2">{data.projects}</div>
                    <div className="text-sm text-gray-600">Projects</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Projections automatically update based on your current metrics. 
                  Changes to conversion rate, profit margin, and current performance directly impact forecasts.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scenario Modeling Tab */}
        <TabsContent value="scenario" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Scenario Analysis Tool
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Revenue Growth %</label>
                    <Input
                      type="number"
                      value={customScenario.revenueGrowth}
                      onChange={(e) => setCustomScenario(prev => ({ ...prev, revenueGrowth: parseFloat(e.target.value) || 0 }))}
                      placeholder="e.g., 25"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Conversion Rate Improvement %</label>
                    <Input
                      type="number"
                      value={customScenario.conversionImprovement}
                      onChange={(e) => setCustomScenario(prev => ({ ...prev, conversionImprovement: parseFloat(e.target.value) || 0 }))}
                      placeholder="e.g., 10"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Cost Reduction %</label>
                    <Input
                      type="number"
                      value={customScenario.costReduction}
                      onChange={(e) => setCustomScenario(prev => ({ ...prev, costReduction: parseFloat(e.target.value) || 0 }))}
                      placeholder="e.g., 15"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  {(() => {
                    const scenario = runScenarioAnalysis();
                    return (
                      <div className="space-y-4">
                        <h4 className="font-semibold text-lg">Scenario Results</h4>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 border rounded-lg">
                            <div className="text-sm text-gray-600">Projected Revenue</div>
                            <div className="text-2xl font-bold text-blue-600">£{(scenario.revenue / 1000).toFixed(0)}K</div>
                            <div className={`text-sm flex items-center gap-1 ${scenario.impact.revenueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {scenario.impact.revenueChange >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                              {Math.abs(scenario.impact.revenueChange).toFixed(1)}% vs current
                            </div>
                          </div>
                          
                          <div className="p-4 border rounded-lg">
                            <div className="text-sm text-gray-600">Projected Profit</div>
                            <div className="text-2xl font-bold text-green-600">£{(scenario.profit / 1000).toFixed(0)}K</div>
                            <div className={`text-sm flex items-center gap-1 ${scenario.impact.profitChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {scenario.impact.profitChange >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                              {Math.abs(scenario.impact.profitChange).toFixed(1)}% vs current
                            </div>
                          </div>
                          
                          <div className="p-4 border rounded-lg">
                            <div className="text-sm text-gray-600">New Conversion Rate</div>
                            <div className="text-2xl font-bold text-purple-600">{scenario.conversion.toFixed(1)}%</div>
                            <div className="text-sm text-gray-600">
                              {scenario.impact.projectsImpact} projects from pipeline
                            </div>
                          </div>
                          
                          <div className="p-4 border rounded-lg">
                            <div className="text-sm text-gray-600">Impact Summary</div>
                            <div className="text-lg font-semibold text-gray-900">
                              {scenario.impact.revenueChange > 0 && scenario.impact.profitChange > 0 ? 'Positive' : 
                               scenario.impact.revenueChange < 0 || scenario.impact.profitChange < 0 ? 'Negative' : 'Neutral'} Scenario
                            </div>
                            <div className="text-sm text-gray-600">
                              Combined impact analysis
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-4 bg-orange-50 rounded-lg">
                          <h5 className="font-medium text-orange-900 mb-2">Implementation Insights</h5>
                          <ul className="text-sm text-orange-800 space-y-1">
                            <li>• Revenue growth of {customScenario.revenueGrowth}% would require {Math.ceil(customScenario.revenueGrowth / 10)} additional major projects</li>
                            <li>• Conversion improvement needs enhanced sales processes and better proposal quality</li>
                            <li>• Cost reduction could be achieved through operational efficiency and tech automation</li>
                          </ul>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI-Generated Business Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {(() => {
                // Generate dynamic insights based on current data
                const insights = [];
                
                // Performance insights
                if (currentMetrics.conversionRate > 20) {
                  insights.push({
                    type: 'positive',
                    title: 'Strong Conversion Performance',
                    content: `Your ${currentMetrics.conversionRate}% conversion rate is significantly above industry average. This indicates strong product-market fit and effective sales processes. Consider scaling marketing efforts to capitalize on this advantage.`,
                    action: 'Increase lead generation by 30-40% to maximize high-conversion opportunity'
                  });
                }
                
                // Market opportunity
                const marketPenetration = (currentMetrics.currentTurnover / marketData.targetableMarket) * 100;
                if (marketPenetration < 0.1) {
                  insights.push({
                    type: 'opportunity',
                    title: 'Massive Untapped Market',
                    content: `You currently capture ${marketPenetration.toFixed(4)}% of the £${(marketData.targetableMarket/1000000000).toFixed(1)}B premium market. Even reaching 0.1% market share would increase revenue by ${((0.001 * marketData.targetableMarket) / currentMetrics.currentTurnover).toFixed(1)}x.`,
                    action: 'Target 0.05% market share within 18 months through strategic expansion'
                  });
                }
                
                // Pipeline insights
                const pipelineMonths = currentMetrics.pipelineValue / (currentMetrics.currentTurnover / currentMetrics.monthsOperating);
                insights.push({
                  type: 'pipeline',
                  title: 'Pipeline Conversion Opportunity',
                  content: `Your £${(currentMetrics.pipelineValue/1000).toFixed(0)}K pipeline represents ${pipelineMonths.toFixed(1)} months of current revenue. At ${currentMetrics.conversionRate}% conversion, expect £${((currentMetrics.pipelineValue * currentMetrics.conversionRate / 100)/1000).toFixed(0)}K in wins.`,
                  action: 'Focus on accelerating pipeline conversion through improved proposal quality'
                });
                
                // Profitability insight
                const monthlyProfit = (currentMetrics.currentTurnover / currentMetrics.monthsOperating) * (currentMetrics.profitMargin / 100);
                const burnRateCoverage = monthlyProfit / currentMetrics.monthlyBurnRate;
                if (burnRateCoverage > 1) {
                  insights.push({
                    type: 'financial',
                    title: 'Profitable Operating Model',
                    content: `Monthly profit of £${(monthlyProfit/1000).toFixed(0)}K covers ${(burnRateCoverage * 100).toFixed(0)}% of £${(currentMetrics.monthlyBurnRate/1000).toFixed(0)}K burn rate. Strong foundation for growth investment.`,
                    action: 'Reinvest excess cash flow into growth initiatives and market expansion'
                  });
                }
                
                return insights.map((insight, index) => (
                  <div key={index} className={`p-4 rounded-lg border-l-4 ${
                    insight.type === 'positive' ? 'bg-green-50 border-green-400' :
                    insight.type === 'opportunity' ? 'bg-blue-50 border-blue-400' :
                    insight.type === 'pipeline' ? 'bg-purple-50 border-purple-400' :
                    'bg-orange-50 border-orange-400'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                      <Badge className={`${
                        insight.type === 'positive' ? 'bg-green-100 text-green-800' :
                        insight.type === 'opportunity' ? 'bg-blue-100 text-blue-800' :
                        insight.type === 'pipeline' ? 'bg-purple-100 text-purple-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {insight.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-700 mb-3">{insight.content}</p>
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-medium text-gray-900">Recommended Action:</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1 pl-6">{insight.action}</p>
                  </div>
                ));
              })()}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StrategyAnalysis;