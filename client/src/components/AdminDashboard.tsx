import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AdminStats from "./AdminStats";

interface AdminDashboardProps {
  onLogout: () => void;
}

interface ActivityState {
  status: "waiting" | "open" | "closed";
  startAt?: number | null;
  endAt?: number | null;
}

const AdminDashboard = ({ onLogout }: AdminDashboardProps) => {
  const [winProbability, setWinProbability] = useState([10]); // 默认10%
  const [isSaving, setIsSaving] = useState(false);
  const [activityState, setActivityState] = useState<ActivityState | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isUpdatingWindow, setIsUpdatingWindow] = useState(false);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const [stats, setStats] = useState({
    totalParticipants: 0,
    totalWinners: 0,
    totalBagsGiven: 0,
    winRate: 0.1,
    todayStats: {
      participants: 0,
      winners: 0,
      bagsGiven: 0,
    },
  });

  const [winnerList, setWinnerList] = useState<any[]>([]);

  // 加载初始数据
  useEffect(() => {
    loadActivityStatus();
    loadStats();
    loadWinnerList();
    loadWinProbability();
  }, []);

  // 加载活动状态
  const loadActivityStatus = async () => {
    try {
      const response = await fetch('/api/status');
      const data = await response.json();
      
      if (data.ok) {
        setActivityState({
          status: data.status,
          startAt: data.startAt,
          endAt: data.endAt
        });

        // 设置时间输入框的值
        if (data.startAt) {
          setStartTime(new Date(data.startAt).toISOString().slice(0, 16));
        }
        if (data.endAt) {
          setEndTime(new Date(data.endAt).toISOString().slice(0, 16));
        }
      }
    } catch (error) {
      console.error('Failed to load activity status:', error);
    }
  };

  // 加载统计数据
  const loadStats = async () => {
    try {
      const response = await fetch('/api/admin/stats', {
        headers: {
          'x-admin-password': 'admin123'
        }
      });
      const data = await response.json();
      
      if (data.ok) {
        setStats({
          totalParticipants: data.totalParticipants,
          totalWinners: data.totalWinners,
          totalBagsGiven: data.totalBagsGiven,
          winRate: data.winRate,
          todayStats: data.todayStats
        });
        
        // 同时更新中奖概率滑块的值
        setWinProbability([Math.round(data.winRate * 100)]);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  // 加载中奖名单
  const loadWinnerList = async () => {
    try {
      // 这里应该有一个专门的API端点来获取中奖名单
      // 暂时使用空数组，实际项目中需要添加对应的API
      setWinnerList([]);
    } catch (error) {
      console.error('Failed to load winner list:', error);
    }
  };

  // 加载中奖概率
  const loadWinProbability = async () => {
    // 从stats中获取winRate
  };

  // 保存中奖概率
  const handleSaveProbability = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/admin/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': 'admin123'
        },
        body: JSON.stringify({ probability: winProbability[0] / 100 })
      });

      const data = await response.json();
      if (!data.ok) {
        throw new Error(data.msg || '保存失败');
      }
      
      // 重新加载统计数据
      await loadStats();
    } catch (error) {
      console.error('Failed to save probability:', error);
      alert('保存概率失败：' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsSaving(false);
    }
  };

  // 更新活动状态
  const handleUpdateStatus = async (newStatus: string) => {
    setIsUpdatingStatus(true);
    try {
      const response = await fetch('/api/admin/set-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': 'admin123'
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();
      if (!data.ok) {
        throw new Error(data.msg || '更新失败');
      }

      // 重新加载活动状态
      await loadActivityStatus();
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('更新状态失败：' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // 更新时间窗口
  const handleUpdateWindow = async () => {
    setIsUpdatingWindow(true);
    try {
      const startTimestamp = startTime ? new Date(startTime).getTime() : null;
      const endTimestamp = endTime ? new Date(endTime).getTime() : null;

      const response = await fetch('/api/admin/set-window', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': 'admin123'
        },
        body: JSON.stringify({ 
          startAt: startTimestamp,
          endAt: endTimestamp
        })
      });

      const data = await response.json();
      if (!data.ok) {
        throw new Error(data.msg || '更新失败');
      }

      // 重新加载活动状态
      await loadActivityStatus();
    } catch (error) {
      console.error('Failed to update window:', error);
      alert('更新时间窗口失败：' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsUpdatingWindow(false);
    }
  };

  // 导出CSV
  const handleExportCSV = async () => {
    try {
      const response = await fetch('/api/admin/export', {
        headers: {
          'x-admin-password': 'admin123'
        }
      });

      if (!response.ok) {
        throw new Error('导出失败');
      }

      // 创建下载链接
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `mahjong_lottery_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export CSV:', error);
      alert('导出数据失败：' + (error instanceof Error ? error.message : String(error)));
    }
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
        <AdminStats stats={stats} />

        {/* 活动状态控制 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>活动状态控制</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span>当前状态：</span>
                <Badge 
                  variant={
                    activityState?.status === "open" ? "default" : 
                    activityState?.status === "waiting" ? "secondary" : "destructive"
                  }
                >
                  {activityState?.status === "open" && "活动进行中"}
                  {activityState?.status === "waiting" && "等待开始"}
                  {activityState?.status === "closed" && "已结束"}
                </Badge>
              </div>
              
              <Select 
                onValueChange={handleUpdateStatus}
                disabled={isUpdatingStatus}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="切换状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="waiting">等待开始</SelectItem>
                  <SelectItem value="open">开始活动</SelectItem>
                  <SelectItem value="closed">结束活动</SelectItem>
                </SelectContent>
              </Select>

              {isUpdatingStatus && (
                <span className="text-sm text-muted-foreground">更新中...</span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">开始时间（可选）</Label>
                <Input
                  id="startTime"
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  data-testid="input-start-time"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endTime">结束时间（可选）</Label>
                <Input
                  id="endTime"
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  data-testid="input-end-time"
                />
              </div>
            </div>

            <Button 
              onClick={handleUpdateWindow}
              disabled={isUpdatingWindow}
              variant="outline"
              data-testid="button-update-window"
            >
              {isUpdatingWindow ? "更新中..." : "更新时间设置"}
            </Button>

            <div className="text-xs text-muted-foreground">
              <p>• 设置时间后，系统将自动在指定时间开始/结束活动</p>
              <p>• 留空表示仅手动控制状态</p>
            </div>
          </CardContent>
        </Card>

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
                  {winnerList.slice(0, 3).map((winner: any) => (
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
                  {winnerList.map((winner: any) => (
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