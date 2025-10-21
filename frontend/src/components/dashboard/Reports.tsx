import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Search,
  Download,
  Filter,
  BarChart,
  FileSpreadsheet,
  Eye,
  MoreHorizontal,
  FileText
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

// Mock data - replace with real API data
const mockReports = [
  {
    id: "REP001",
    name: "Monthly Sales Report",
    type: "SALES",
    period: "2025-08",
    status: "GENERATED",
    generatedBy: "System",
    date: "2025-09-01",
  },
  {
    id: "REP002",
    name: "User Activity Report",
    type: "ANALYTICS",
    period: "2025-08",
    status: "PENDING",
    generatedBy: "Admin",
    date: "2025-09-09",
  },
  // Add more mock reports as needed
];

export default function Reports() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [reportType, setReportType] = useState("all");

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 p-6 bg-background"
    >
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('admin.reportsManagement')}</h1>
          <p className="text-muted-foreground">{t('admin.reportsManagementDesc')}</p>
        </div>
        <Button className="bg-green-primary hover:bg-green-primary/90">
          <FileText className="mr-2 h-4 w-4" />
          {t('admin.generateReport')}
        </Button>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('admin.totalReports')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('admin.generatedThisMonth')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('admin.scheduledReports')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('admin.pendingReports')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('admin.reportsList')}</CardTitle>
          <CardDescription>{t('admin.reportsListDesc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('admin.searchReports')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t('admin.selectType')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="all">{t('admin.allTypes')}</SelectItem>
                    <SelectItem value="sales">{t('admin.salesReports')}</SelectItem>
                    <SelectItem value="analytics">{t('admin.analyticsReports')}</SelectItem>
                    <SelectItem value="users">{t('admin.userReports')}</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('admin.reportName')}</TableHead>
                  <TableHead>{t('admin.type')}</TableHead>
                  <TableHead>{t('admin.period')}</TableHead>
                  <TableHead>{t('admin.status')}</TableHead>
                  <TableHead>{t('admin.generatedBy')}</TableHead>
                  <TableHead>{t('admin.date')}</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">{report.name}</TableCell>
                    <TableCell>
                      {report.type === 'SALES' ? (
                        <Badge variant="secondary">
                          <BarChart className="w-3 h-3 mr-1" />
                          {report.type}
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          <FileSpreadsheet className="w-3 h-3 mr-1" />
                          {report.type}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{report.period}</TableCell>
                    <TableCell>
                      <Badge variant={report.status === 'GENERATED' ? 'default' : 'secondary'}>
                        {report.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{report.generatedBy}</TableCell>
                    <TableCell>{report.date}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>{t('admin.actions')}</DropdownMenuLabel>
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            {t('admin.view')}
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="mr-2 h-4 w-4" />
                            {t('admin.download')}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            {t('admin.delete')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
