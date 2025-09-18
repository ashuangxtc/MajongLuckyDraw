import React, { useEffect, useState, useRef } from "react";
import "./lottery.css";
import { getClientId, shortId } from "../utils/clientId";
import { useActivityStatus } from "../utils/useActivityStatus";
import { useMahjongAnim } from "../utils/useMahjongAnim";
import { apiFetch } from "../utils/request";


type Phase = 'idle'|'staging'|'ready'|'revealing'|'locked';
type Face = 'hongzhong'|'baiban';

export default function DrawPage(){
  const cid = getClientId();
  const { status, canDraw, refresh, markAlready } = useActivityStatus();
  const { cards, setCards, revealCardByDeck, initSlotsFromLayout, layoutToSlots, overlapCenter, shuffleBySlots } = useMahjongAnim('#mahjong-board');
  const [joined, setJoined] = useState(false);
  const [pickedId, setPickedId] = useState<string|undefined>(undefined);
  const [phase, setPhase] = useState<Phase>('idle');
  const [busy, setBusy] = useState(false);
  const slotsReadyRef = useRef(false);
  const [result, setResult] = useState<{open:boolean; win:boolean; title:string; desc:string}>({open:false, win:false, title:'', desc:''});
  const [toast, setToast] = useState<string>('');

  useEffect(()=>{
    (async ()=>{
      try {
        const r = await apiFetch('/api/lottery/join',{method:'POST'});
        if (r.ok) setJoined(true);
      } catch {}
      refresh();
    })();
  },[refresh]);

  // 后台重置后，若 cookie 失效导致未 joined，则在可抽且 idle 时自动重试 join 一次
  useEffect(()=>{
    (async ()=>{
      if (status==='start' && phase==='idle' && !joined) {
        try{ const r = await apiFetch('/api/lottery/join',{method:'POST'}); if(r.ok) setJoined(true);}catch{}
      }
    })();
  },[status, phase, joined]);

  // 管理端状态影响前端可玩性：start → 解锁下一轮；end/pause → 立即回到 idle
  useEffect(()=>{
    if(status==='start' && phase==='locked') setPhase('idle');
    if((status==='end' || status==='pause') && phase!=='idle') setPhase('idle');
  }, [status]);

  // 管理端重置后，eligibility 轮询让 canDraw=true：仅当处于 locked 时解锁为 idle
  useEffect(()=>{
    if (status==='start' && canDraw && phase==='locked') {
      setPhase('idle');
    }
  }, [status, canDraw, phase]);

  // 若已参与（start 且 canDraw=false），明确进入 locked，便于按钮与提示文案统一
  useEffect(()=>{
    if (status==='start' && !canDraw) setPhase('locked');
  }, [status, canDraw]);

  function onBlocked(){
    // 已参与：弹网页弹窗，提示需管理员重置
    if (phase==='locked' || (status==='start' && !canDraw)) {
      setResult({
        open:true,
        win:false,
        title:'本设备已参与',
        desc:'本轮每台设备仅可参与一次。如需再次体验，请联系管理员在后台重置设备后再试。'
      });
      return;
    }
    if (status==='pause') { alert('活动暂停，稍后再试'); return; }
    if (status==='end') { alert('活动已结束'); return; }
    if (status!=='start') { alert('活动未开始'); return; }
    // 仅当“未参与且未开始洗牌”时，出现上升提示
    if (canDraw && phase!=='ready') {
      setToast('请先点击“开始抽奖”进行洗牌');
      setTimeout(()=>setToast(''), 1000);
      return;
    }
    // 兜底
    alert('暂不可操作，请稍后再试');
  }

  async function handleStart(){
    if(!canDraw || phase!=='idle') return onBlocked();
    if(!joined){ try{ const r=await apiFetch('/api/lottery/join',{method:'POST'}); if(r.ok) setJoined(true);}catch{} }
    setPhase('staging');
    // 初始化槽位
    if(!slotsReadyRef.current){ initSlotsFromLayout(); slotsReadyRef.current = true; }
    // 1) 预演：展示“一红两白”，再翻回背面（关闭 relayout 干扰）
    ;(window as any).__REL_DISABLE__?.();
    const preview = makePreviewDeckOneRed();
    setCards(cs => cs.map((c, idx) => ({...c, face: preview[idx], flipped:true})));
    await sleep(600);
    setCards(cs => cs.map(c => ({...c, flipped:false})));
    await sleep(400);
    // 2) 重叠→槽位洗牌→回位
    overlapCenter();
    await sleep(300);
    await shuffleBySlots(12);
    layoutToSlots();
    // 进入可点击阶段
    setCards(cs => cs.map(c => ({...c, canClick:true, state:'breathing', flipped:false})));
    ;(window as any).__REL_ENABLE__?.();
    setPhase('ready');
  }

  async function handleReveal(id:string){
    if(!canDraw || phase!=='ready') return onBlocked();
    if (busy) return;
    setBusy(true);
    setPhase('revealing');
    if(!joined){ try{ const r=await apiFetch('/api/lottery/join',{method:'POST'}); if(r.ok) setJoined(true);}catch{} }
    const pickIndex = cards.findIndex(c=>c.id===id);
    const res = await apiFetch('/api/lottery/draw',{method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ pick: pickIndex })});
    if(!res.ok){
      if(res.status===409||res.status===429){
        markAlready();
        setResult({open:true, win:false, title:'本设备已参与', desc:'本轮每台设备仅可参与一次。如需再次体验，请联系管理员在后台重置设备。'});
        setBusy(false); setPhase('locked');
        return;
      }
      if(res.status===403){
        setResult({open:true, win:false, title:'活动未开放', desc:'当前活动未开始或已暂停/结束，请稍后再试。'});
        setBusy(false); setPhase('idle');
        return;
      }
      alert(await res.text());
      setBusy(false); setPhase('idle');
      return;
    }
    const data = await res.json();
    const deck = normalizeOneRedDeck(data?.deck as Face[]|undefined, pickIndex, data?.win);
    setPickedId(id);
    setCards(cs=>cs.map((c,idx): any => ({
      ...c,
      face: deck![idx],
      flipped: true,
      canClick:false,
      state: 'revealed',
      z: 1
    })));
    const clickedIsWin = deck![pickIndex] === 'hongzhong';
    setResult({
      open:true, win: clickedIsWin,
      title: clickedIsWin ? '中了！这波红中有排面' : '这次没中，但好运在路上',
      desc:  clickedIsWin
        ? '恭喜翻到红中～去领取你的限量托特包吧。记得拍照打卡，小红书同款红运在线✨'
        : '差一点点就翻到红中啦～下次继续冲！把好运存进相册，下一次翻开就到你。'
    });
    setBusy(false);
    setPhase('locked');
  }

  // 关闭弹窗：仅清理状态，不做任何二次移动/洗牌/放大
  const closeModal = () => {
    setResult({open:false, win:false, title:'', desc:''});
    setPickedId(undefined);
    // 回到背面，保持当前等距位置，不重叠不再洗牌
    layoutToSlots();
    setCards(prev => prev.map((c)=> ({ ...c, flipped:false, state:'back', canClick:false, z:1 })));
  };

  const notice = '⚠️ 抽奖需在工作人员确认并允许后才有效。若您提前扫码参与，需联系工作人员，由其重新开启抽奖。';

  return (
    <main className="dm-root">
      <header className="dm-hero glass">
        <div className="dm-brand">
          <img src="/images/logo/dreammore-logo.png" alt="Dreammore Logo" className="dm-logo" />
          <h1>DREAMMORE 小游戏</h1>
        </div>
      </header>
      <section className="dm-marquee glass" aria-label="notice">
        <div className="marquee">
          <div className="marquee-track">
            <span>{notice}</span>
            <span className="mx"> • </span>
            <span>{notice}</span>
            <span className="mx"> • </span>
            <span>{notice}</span>
          </div>
        </div>
      </section>
      <section className="dm-board glass" id="mahjong-board" aria-label="mahjong-board">
        <div className="cards-wrap">
          {cards.map(c=> (
            <button
              key={c.id}
              className={`card ${c.state} ${pickedId===c.id ? 'picked' : ''}`}
              style={{ left:c.x, top:c.y, zIndex:c.z as any }}
              onClick={()=>{
                // 活动暂停/结束：不触发任何提示
                if (status !== 'start') return;
                // 已参与：弹管理员重置弹窗（不出现洗牌提示）
                if (!canDraw) { onBlocked(); return; }
                // 未参与且未到可点击阶段：给洗牌提示
                if (phase !== 'ready' || !(c as any).canClick) {
                  setToast('请先点击“开始抽奖”进行洗牌');
                  setTimeout(()=>setToast(''), 1000);
                  return;
                }
                handleReveal(c.id);
              }}
              aria-label={`card-${c.id}`}
            >
              <div className={`card-inner ${c.flipped ? 'is-flipped' : ''}`}>
                <div className={`card-face front ${c.face || 'baiban'}`} />
                <div className="card-face back" />
              </div>
            </button>
          ))}
        </div>
        <div className="dm-device-id-watermark">ID {shortId(cid)}</div>
      </section>
      <section className="dm-cta">
        <button className="dm-btn glass" disabled={!canDraw || phase!=='idle'} onClick={handleStart}>
          {status==='start'
            ? (phase==='idle' ? '开始抽奖' : (!canDraw || phase==='locked' ? '已参与' : '请选择'))
            : (status==='pause' ? '活动暂停' : '活动已结束')}
        </button>
      </section>
      <section className="dm-rules glass bordered">
        <h3>参与条件：</h3>
        <ul>
          <li>单笔消费满 88 元，可获得一次抽奖机会。</li>
          <li>三张麻将中抽中 “红中”，即可赢取限量托特包。</li>
        </ul>
        <div className="footnote">*由于环保袋数量有限，每日将限量抽取赠送，还请理解。</div>
      </section>
      {result.open && (
        <div className="modal-mask" onClick={closeModal}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-badge">{result.win ? '🎉' : '🙂'}</div>
            <h3>{result.title}</h3>
            <p className="modal-desc">{result.desc}</p>
            <button className="modal-btn" onClick={closeModal}>知道啦</button>
          </div>
        </div>
      )}
      {toast && (
        <div className="toast-wrap"><div className="toast">{toast}</div></div>
      )}
    </main>
  );
}

function sleep(ms:number){ return new Promise(r=>setTimeout(r,ms)); }

// 工具：预演用 “一红两白”
function makePreviewDeckOneRed(): Face[] { return ['hongzhong','baiban','baiban']; }

// 工具：规范化服务端返回，强制“一红两白”且与点击一致
function normalizeOneRedDeck(serverDeck: Face[] | undefined, pickIndex: number, win?: boolean): Face[] {
  let deck: Face[] = Array.isArray(serverDeck) && serverDeck.length===3 ? [...serverDeck] : ['baiban','baiban','baiban'];
  // 强制只留一个红中
  let reds = deck.filter(v=>v==='hongzhong').length;
  while (reds > 1) { const i = deck.findIndex(v=>v==='hongzhong'); if (i>=0) { deck[i]='baiban'; reds--; } }
  if (reds === 0) { const place = [0,1,2].find(i=>i!==pickIndex) ?? 1; deck[place]='hongzhong'; reds=1; }
  if (win === true) { deck = ['baiban','baiban','baiban']; deck[pickIndex]='hongzhong'; }
  else if (win === false) { deck = ['baiban','baiban','baiban']; const other=[0,1,2].filter(i=>i!==pickIndex); deck[other[Math.floor(Math.random()*other.length)]]='hongzhong'; }
  const finalReds = deck.filter(v=>v==='hongzhong').length;
  if (finalReds !== 1) { deck = ['baiban','baiban','baiban']; const other=[0,1,2].filter(i=>i!==pickIndex); deck[other[0]]='hongzhong'; }
  return deck;
}


