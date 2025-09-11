import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { ActivityStatus, insertDrawSchema, type ActivityStatusType } from "@shared/schema";
import { z } from "zod";
import crypto from "crypto";

// 管理员身份验证中间件
function requireAdmin(req: any, res: any, next: any) {
  const adminPassword = req.headers['x-admin-password'];
  if (adminPassword !== 'admin123') { // 简单验证，生产环境应该使用更安全的方式
    return res.status(401).json({ ok: false, msg: 'unauthorized' });
  }
  next();
}

// 生成用户唯一标识
function generateUserKey(ip: string, userAgent: string): string {
  return crypto.createHash('md5').update(ip + userAgent).digest('hex');
}

// 生成兑换码
function generateRedeemCode(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substr(2, 4).toUpperCase();
  const checksum = crypto.createHash('md5').update(`${date}${random}salt123`).digest('hex').substr(0, 4).toUpperCase();
  return `DM-${date}-${checksum}`;
}

// 检查活动当前状态（考虑时间窗口）
async function getActualActivityStatus(): Promise<ActivityStatusType> {
  const event = await storage.getDefaultEvent();
  const now = Date.now();
  let status: ActivityStatusType = event.status as ActivityStatusType;

  // 如果设置了开始时间且还未到开始时间，强制为waiting
  if (event.startAt && now < event.startAt) {
    status = ActivityStatus.WAITING;
  }
  
  // 如果在开始时间和结束时间之间，且状态不是closed，则为open
  if (event.startAt && now >= event.startAt && (!event.endAt || now <= event.endAt)) {
    status = (event.status === ActivityStatus.CLOSED ? ActivityStatus.CLOSED : ActivityStatus.OPEN);
  }
  
  // 如果设置了结束时间且已过结束时间，强制为closed
  if (event.endAt && now > event.endAt) {
    status = ActivityStatus.CLOSED;
  }

  return status;
}

export async function registerRoutes(app: Express): Promise<Server> {
  
  // 1. 查询当前活动状态
  app.get('/api/status', async (req, res) => {
    try {
      const event = await storage.getDefaultEvent();
      const actualStatus = await getActualActivityStatus();
      
      res.json({
        ok: true,
        status: actualStatus,
        startAt: event.startAt,
        endAt: event.endAt
      });
    } catch (error) {
      res.status(500).json({ ok: false, msg: 'status unavailable' });
    }
  });

  // 2. 执行抽奖逻辑（必须在状态open时才允许）
  app.post('/api/draw', async (req, res) => {
    try {
      const actualStatus = await getActualActivityStatus();
      
      // 检查活动状态
      if (actualStatus !== ActivityStatus.OPEN) {
        return res.status(403).json({ 
          ok: false, 
          msg: actualStatus === ActivityStatus.WAITING ? 'not_started' : 'activity_ended' 
        });
      }

      const clientIP = req.ip || req.connection.remoteAddress || '127.0.0.1';
      const userAgent = req.headers['user-agent'] || '';
      const userKey = generateUserKey(clientIP, userAgent);

      // 检查用户是否已经参与过
      const existingDraw = await storage.getUserDraw(userKey);
      if (existingDraw) {
        return res.status(409).json({ ok: false, msg: 'already_participated' });
      }

      // 获取中奖概率
      const winProbability = await storage.getWinProbability();
      const isWinner = Math.random() < winProbability;
      
      // 创建抽奖记录
      const drawData = {
        userKey,
        ip: clientIP,
        userAgent,
        result: isWinner ? "hongzhong" : "baiban",
        code: isWinner ? generateRedeemCode() : undefined
      };

      const draw = await storage.createDraw(drawData);

      res.json({
        ok: true,
        win: isWinner,
        prize: drawData.result,
        code: draw.code
      });

    } catch (error) {
      console.error('Draw error:', error);
      res.status(500).json({ ok: false, msg: 'draw_error' });
    }
  });

  // 3. 管理员手动切换状态
  app.post('/api/admin/set-status', requireAdmin, async (req, res) => {
    try {
      const { status } = req.body;
      
      if (!Object.values(ActivityStatus).includes(status)) {
        return res.status(400).json({ ok: false, msg: 'invalid_status' });
      }

      await storage.updateEventStatus(status);
      res.json({ ok: true });
    } catch (error) {
      res.status(500).json({ ok: false });
    }
  });

  // 4. 设置活动时间窗口
  app.post('/api/admin/set-window', requireAdmin, async (req, res) => {
    try {
      const { startAt, endAt } = req.body;
      
      await storage.updateEventWindow(
        startAt ? parseInt(startAt) : undefined,
        endAt ? parseInt(endAt) : undefined
      );
      
      res.json({ ok: true });
    } catch (error) {
      res.status(500).json({ ok: false });
    }
  });

  // 5. 获取统计数据
  app.get('/api/admin/stats', requireAdmin, async (req, res) => {
    try {
      const stats = await storage.getDrawStats();
      const winProbability = await storage.getWinProbability();
      
      res.json({
        ok: true,
        ...stats,
        winRate: winProbability
      });
    } catch (error) {
      res.status(500).json({ ok: false });
    }
  });

  // 6. 导出CSV数据
  app.get('/api/admin/export', requireAdmin, async (req, res) => {
    try {
      const draws = await storage.getAllDraws();
      const winners = draws.filter(draw => draw.result === "hongzhong");
      
      // 构建CSV数据
      const csvHeader = "时间,兑换码,IP地址,浏览器信息,状态\n";
      const csvData = winners.map(draw => {
        const timestamp = new Date(draw.timestamp).toLocaleString('zh-CN');
        const status = draw.redeemed ? "已核销" : "未核销";
        return `"${timestamp}","${draw.code}","${draw.ip}","${draw.userAgent}","${status}"`;
      }).join("\n");
      
      const csv = csvHeader + csvData;
      const filename = `mahjong_lottery_${new Date().toISOString().slice(0, 10)}.csv`;
      
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send('\uFEFF' + csv); // 添加BOM以支持中文
    } catch (error) {
      res.status(500).json({ ok: false });
    }
  });

  // 7. 更新中奖概率
  app.post('/api/admin/config', requireAdmin, async (req, res) => {
    try {
      const { probability } = req.body;
      
      if (typeof probability !== 'number' || probability < 0 || probability > 1) {
        return res.status(400).json({ ok: false, msg: 'invalid_probability' });
      }

      await storage.setWinProbability(probability);
      res.json({ ok: true });
    } catch (error) {
      res.status(500).json({ ok: false });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
