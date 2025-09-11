import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import AdminStats from "./AdminStats";

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard = ({ onLogout }: AdminDashboardProps) => {
  const [winProbability, setWinProbability] = useState([10]); // 默认10%
  const [isSaving, setIsSaving] = useState(false);

  //todo: remove mock functionality
  const mockStats = {
    totalParticipants: 1247,
    totalWinners: 126,
    totalBagsGiven: 118,
    winRate: winProbability[0] / 100,
    todayStats: {
      participants: 89,
      winners: 9,
      bagsGiven: 8,
    },
  };

  const mockWinnerList = [
    { id: 1, timestamp: "2024-12-11 14:30:25", code: "DM-20241211-A8F2", ip: "192.168.1.100", userAgent: "Mozilla/5.0..." },
    { id: 2, timestamp: "2024-12-11 13:15:10", code: "DM-20241211-B7G3", ip: "192.168.1.105", userAgent: "Mozilla/5.0..." },
    { id: 3, timestamp: "2024-12-11 11:45:33", code: "DM-20241211-C6H4", ip: "192.168.1.112", userAgent: "Mozilla/5.0..." },
    { id: 4, timestamp: "2024-12-11 10:20:15", code: "DM-20241211-D5I5", ip: "192.168.1.120", userAgent: "Mozilla/5.0..." },
    { id: 5, timestamp: "2024-12-11 09:30:48", code: "DM-20241211-E4J6", ip: "192.168.1.115", userAgent: "Mozilla/5.0..." },
  ];

  const handleSaveProbability = async () => {
    setIsSaving(true);
    console.log("Saving probability:", winProbability[0] + "%"); //todo: remove mock functionality
    await new Promise(resolve => setTimeout(resolve, 1000)); // 模拟保存延迟
    setIsSaving(false);
  };

  const handleExportCSV = () => {
    console.log("Exporting CSV..."); //todo: remove mock functionality
    // 模拟CSV导出
    const csvData = mockWinnerList.map(winner => 
      [winner.timestamp, winner.code, winner.ip, winner.userAgent.substring(0, 50) + "..."].join(",")
    );
    const csv = ["时间,兑换码,IP地址,浏览器信息", ...csvData].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `mahjong_lottery_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* 顶部导航 */}
      <div className="border-b">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-2xl font-bold">麻将抽奖管理后台</h1>
          <Button onClick={onLogout} variant="outline" data-testid="button-logout">
            退出登录
          </Button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* 统计数据 */}
        <AdminStats stats={mockStats} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 概率配置 */}
          <Card>
            <CardHeader>
              <CardTitle>中奖概率配置</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>红中中奖概率</Label>
                <div className="px-3">
                  <Slider
                    value={winProbability}
                    onValueChange={setWinProbability}
                    max={100}
                    step={1}
                    className="w-full"
                    data-testid="slider-probability"
                  />
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>0%</span>
                  <Badge variant="secondary" className="text-lg">
                    {winProbability[0]}%
                  </Badge>
                  <span>100%</span>
                </div>
              </div>

              <Button 
                onClick={handleSaveProbability}
                disabled={isSaving}
                className="w-full"
                data-testid="button-save-probability"
              >
                {isSaving ? "保存中..." : "保存设置"}
              </Button>

              <div className="text-xs text-muted-foreground">
                <p>修改后立即生效，影响后续所有抽奖</p>
              </div>
            </CardContent>
          </Card>

          {/* 数据导出 */}
          <Card>
            <CardHeader>
              <CardTitle>数据管理</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  导出所有中奖记录为CSV文件，包含时间、兑换码、IP地址等信息
                </p>
                <Button 
                  onClick={handleExportCSV}
                  variant="outline"
                  className="w-full"
                  data-testid="button-export-csv"
                >
                  导出CSV数据
                </Button>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium text-sm mb-2">最近中奖记录</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {mockWinnerList.slice(0, 3).map((winner) => (
                    <div key={winner.id} className="text-xs space-y-1 p-2 bg-muted rounded">
                      <div className="flex justify-between">
                        <span className="font-mono">{winner.code}</span>
                        <span className="text-muted-foreground">{winner.timestamp}</span>
                      </div>
                      <div className="text-muted-foreground truncate">
                        IP: {winner.ip}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 详细记录表格 */}
        <Card>
          <CardHeader>
            <CardTitle>中奖记录详情</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">时间</th>
                    <th className="text-left p-2">兑换码</th>
                    <th className="text-left p-2">IP地址</th>
                    <th className="text-left p-2">浏览器信息</th>
                  </tr>
                </thead>
                <tbody>
                  {mockWinnerList.map((winner) => (
                    <tr key={winner.id} className="border-b hover:bg-muted/50">
                      <td className="p-2 font-mono text-xs">{winner.timestamp}</td>
                      <td className="p-2">
                        <Badge variant="outline" className="font-mono">
                          {winner.code}
                        </Badge>
                      </td>
                      <td className="p-2 font-mono text-xs">{winner.ip}</td>
                      <td className="p-2 text-xs truncate max-w-xs">
                        {winner.userAgent}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;