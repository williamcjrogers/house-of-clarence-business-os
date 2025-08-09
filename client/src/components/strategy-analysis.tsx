import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  Zap
} from 'lucide-react';

const StrategyAnalysis = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('12months');

  // Current Business Metrics (from your business plan)
  const currentMetrics = {
    monthsOperating: 4,
    projectsSecured: 9, // 1 commercial + 2 development + 6 residential
    currentTurnover: 917000,
    pendingProjects: 4,
    pendingValue: 375000,
    pipelineProjects: 18,
    pipelineValue: 1475000,
    profitMargin: 26.5, // average of 24-29%
    conversionRate: 24, // 2025 average
    monthlyBurnRate: 59000
  };

  // Market Opportunity Data
  const marketData = {
    ukSecondFixMarket: 9600000000, // £9.6B mid-range
    premiumSegment: 25, // 25% of market
    targetableMarket: 2400000000, // £2.4B
    currentMarketShare: 0.00038, // Very small but growing
    projectedShare: 0.001, // Target 0.1% in 3 years
    growthRate: 8.5 // Annual market growth %
  };

  // Financial Projections
  const projections = {
    month6: { revenue: 1500000, profit: 390000, projects: 12 },
    year1: { revenue: 3200000, profit: 832000, projects: 28 },
    year2: { revenue: 7500000, profit: 1950000, projects: 65 },
    year3: { revenue: 15000000, profit: 3900000, projects: 125 }
  };

  // Tech Investment Phases
  const techPhases = [
    { 
      phase: 1, 
      name: "Foundation", 
      months: "1-6", 
      investment: 7500000, 
      impact: "15-20% conversion improvement",
      status: "pending"
    },
    { 
      phase: 2, 
      name: "Intelligence", 
      months: "7-12", 
      investment: 11500000, 
      impact: "25% inventory cost reduction",
      status: "pending"
    },
    { 
      phase: 3, 
      name: "Innovation", 
      months: "13-18", 
      investment: 15000000, 
      impact: "30% order value increase",
      status: "pending"
    },
    { 
      phase: 4, 
      name: "Optimization", 
      months: "19-24", 
      investment: 10000000, 
      impact: "80% digital sales penetration",
      status: "pending"
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Business Strategy & Analysis</h1>
          <p className="text-gray-600 mt-2">Strategic insights and growth projections for House of Clarence</p>
        </div>
        <Badge className="bg-green-100 text-green-800 px-3 py-1">
          4 Months Operating
        </Badge>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="financials">Financials</TabsTrigger>
          <TabsTrigger value="market">Market</TabsTrigger>
          <TabsTrigger value="technology">Tech Strategy</TabsTrigger>
          <TabsTrigger value="competitive">Competition</TabsTrigger>
          <TabsTrigger value="projections">Projections</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Current Turnover</p>
                    <p className="text-2xl font-bold text-gray-900">£{(currentMetrics.currentTurnover / 1000).toLocaleString()}K</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
                <div className="mt-2 flex items-center text-sm text-green-600">
                  <ArrowUpRight className="h-4 w-4" />
                  <span>4 months operating</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Projects Secured</p>
                    <p className="text-2xl font-bold text-gray-900">{currentMetrics.projectsSecured}</p>
                  </div>
                  <Building className="h-8 w-8 text-blue-600" />
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  1 commercial, 2 development, 6 residential
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{currentMetrics.conversionRate}%</p>
                  </div>
                  <Target className="h-8 w-8 text-purple-600" />
                </div>
                <div className="mt-2 flex items-center text-sm text-green-600">
                  <ArrowUpRight className="h-4 w-4" />
                  <span>Up from 18% in 2024</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pipeline Value</p>
                    <p className="text-2xl font-bold text-gray-900">£{(currentMetrics.pipelineValue / 1000).toLocaleString()}K</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-orange-600" />
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  18 projects through Dec 2025
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Key Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Strategic Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-green-200 rounded-lg bg-green-50">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-semibold text-green-900">Strong Foundation</span>
                  </div>
                  <p className="text-sm text-green-800">£917K turnover in just 4 months with improving conversion rates (24% vs 18% in 2024)</p>
                </div>
                
                <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    <span className="font-semibold text-blue-900">Untapped Pipeline</span>
                  </div>
                  <p className="text-sm text-blue-800">300+ engaged clients with significant design-side opportunities yet to be activated</p>
                </div>

                <div className="p-4 border border-purple-200 rounded-lg bg-purple-50">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="h-5 w-5 text-purple-600" />
                    <span className="font-semibold text-purple-900">Technology Advantage</span>
                  </div>
                  <p className="text-sm text-purple-800">18-24 month window to establish tech leadership before innovations become table stakes</p>
                </div>

                <div className="p-4 border border-orange-200 rounded-lg bg-orange-50">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-5 w-5 text-orange-600" />
                    <span className="font-semibold text-orange-900">Scaling Opportunity</span>
                  </div>
                  <p className="text-sm text-orange-800">Showroom launch in Dec 2025 will unlock franchise models and direct-to-client sales</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Financials Tab */}
        <TabsContent value="financials" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trajectory</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Current (4 months)</span>
                    <span className="text-lg font-bold">£{(currentMetrics.currentTurnover / 1000).toLocaleString()}K</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Year 1 Target</span>
                    <span className="text-lg font-bold text-green-600">£{(projections.year1.revenue / 1000).toLocaleString()}K</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Year 2 Target</span>
                    <span className="text-lg font-bold text-blue-600">£{(projections.year2.revenue / 1000).toLocaleString()}K</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Year 3 Target</span>
                    <span className="text-lg font-bold text-purple-600">£{(projections.year3.revenue / 1000).toLocaleString()}K</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Profitability Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Current Profit Margin</span>
                      <span className="text-sm font-bold">{currentMetrics.profitMargin}%</span>
                    </div>
                    <Progress value={currentMetrics.profitMargin} className="h-2" />
                  </div>
                  
                  <div className="pt-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Monthly Burn Rate</span>
                      <span className="text-sm font-medium">£{(currentMetrics.monthlyBurnRate / 1000).toLocaleString()}K</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Runway (current cash)</span>
                      <span className="text-sm font-medium text-green-600">12+ months</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Operational Costs Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Operational Cost Structure (£59K/month)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">£25K</div>
                  <div className="text-sm text-gray-600">Monthly Salaries</div>
                  <div className="text-xs text-gray-500">42% of costs</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">£12K</div>
                  <div className="text-sm text-gray-600">Showroom Rent</div>
                  <div className="text-xs text-gray-500">20% of costs</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">£10.7K</div>
                  <div className="text-sm text-gray-600">Warehouse Rent</div>
                  <div className="text-xs text-gray-500">18% of costs</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">£11.3K</div>
                  <div className="text-sm text-gray-600">Admin/Utilities</div>
                  <div className="text-xs text-gray-500">19% of costs</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Market Tab */}
        <TabsContent value="market" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Market Opportunity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    £{(marketData.ukSecondFixMarket / 1000000000).toFixed(1)}B
                  </div>
                  <div className="text-sm text-gray-600 mb-4">UK Second Fix Market</div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="font-semibold text-purple-600">£{(marketData.targetableMarket / 1000000000).toFixed(1)}B</div>
                      <div className="text-gray-600">Premium Segment</div>
                    </div>
                    <div>
                      <div className="font-semibold text-green-600">{marketData.growthRate}%</div>
                      <div className="text-gray-600">Annual Growth</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Client Segments</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">Residential Developers</div>
                      <div className="text-sm text-gray-600">Primary target segment</div>
                    </div>
                    <Badge>High Priority</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">Design & Build Contractors</div>
                      <div className="text-sm text-gray-600">Strong conversion rates</div>
                    </div>
                    <Badge>High Priority</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">Prime/Super Prime Homeowners</div>
                      <div className="text-sm text-gray-600">Highest margins</div>
                    </div>
                    <Badge variant="secondary">Medium Priority</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">Architects & Design Studios</div>
                      <div className="text-sm text-gray-600">Referral partners</div>
                    </div>
                    <Badge variant="secondary">Medium Priority</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Conversion Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Conversion Performance Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Build-Side Projects (2025)</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Quotations Submitted</span>
                      <span className="font-medium">103</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Projects Won</span>
                      <span className="font-medium text-green-600">25</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Win Rate</span>
                      <span className="font-medium text-green-600">24%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Value Won</span>
                      <span className="font-medium">£6.0M</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Design-Side Opportunity</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Planning Approved Projects</span>
                      <span className="font-medium">69</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Building Regs Projects</span>
                      <span className="font-medium">59</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Untapped Opportunity</span>
                      <span className="font-medium text-orange-600">128 projects</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Potential Value</span>
                      <span className="font-medium text-orange-600">£2.5M+</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Technology Strategy Tab */}
        <TabsContent value="technology" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                AI/Technology Investment Roadmap
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {techPhases.map((phase, index) => (
                  <div key={phase.phase} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-lg">Phase {phase.phase}: {phase.name}</h4>
                        <p className="text-sm text-gray-600">Months {phase.months}</p>
                      </div>
                      <Badge variant={phase.status === 'pending' ? 'secondary' : 'default'}>
                        {phase.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Investment Required</p>
                        <p className="text-xl font-bold text-blue-600">£{(phase.investment / 1000000).toFixed(1)}M</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Expected Impact</p>
                        <p className="text-sm text-green-600">{phase.impact}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold text-blue-900">Critical Timing Window</span>
                </div>
                <p className="text-sm text-blue-800">
                  Industry analysis shows 18-24 month window to establish technology leadership 
                  before current innovations become table stakes. Early adoption provides sustainable 
                  competitive moat.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Other tabs would continue here... */}
        <TabsContent value="competitive" className="space-y-6">
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Competitive Analysis</h3>
            <p className="text-gray-600">Coming soon - detailed competitive landscape analysis</p>
          </div>
        </TabsContent>

        <TabsContent value="projections" className="space-y-6">
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Detailed Projections</h3>
            <p className="text-gray-600">Coming soon - interactive financial modeling and scenario planning</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StrategyAnalysis;