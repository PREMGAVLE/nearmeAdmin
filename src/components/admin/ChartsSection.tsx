import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, DollarSign, Building, PieChart } from 'lucide-react';

interface ChartsSectionProps {
  totalLeads: number;
  totalRevenue: number;
  totalBusinesses: number;
  categoryData: { name: string; value: number }[];
}

export function ChartsSection({ totalLeads, totalRevenue, totalBusinesses, categoryData }: ChartsSectionProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Leads Over Time - Line Chart */}
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-blue-600" />
            Leads Over Time
          </CardTitle>
          <CardDescription>Daily lead generation trends</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{totalLeads}</p>
              <p className="text-sm text-blue-500">Total Leads</p>
              <div className="mt-4 text-xs text-blue-400">Chart integration ready</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Revenue Analytics - Bar Chart */}
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            Revenue Analytics
          </CardTitle>
          <CardDescription>Monthly revenue performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gradient-to-br from-green-50 to-green-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">₹{totalRevenue.toLocaleString()}</p>
              <p className="text-sm text-green-500">Total Revenue</p>
              <div className="mt-4 text-xs text-green-400">Chart integration ready</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business Growth - Area Chart */}
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5 text-purple-600" />
            Business Growth
          </CardTitle>
          <CardDescription>Business registration trends</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">{totalBusinesses}</p>
              <p className="text-sm text-purple-500">Total Businesses</p>
              <div className="mt-4 text-xs text-purple-400">Chart integration ready</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Distribution - Pie Chart */}
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5 text-orange-600" />
            Category Distribution
          </CardTitle>
          <CardDescription>Businesses by category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <div className="grid grid-cols-2 gap-2 text-xs">
                {categoryData.slice(0, 4).map((cat, idx) => (
                  <div key={idx} className="bg-white/70 rounded p-2">
                    <p className="font-medium text-orange-700">{cat.name}</p>
                    <p className="text-orange-600">{cat.value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-xs text-orange-400">Chart integration ready</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}