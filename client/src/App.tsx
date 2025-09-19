import { Route, Switch } from "wouter";

function HomePage() {
  return (
    <div style={{ padding: 24, textAlign: 'center' }}>
      <h1>麻将抽奖系统</h1>
      <p>系统正在维护中...</p>
    </div>
  );
}

function AdminPage() {
  return (
    <div style={{ padding: 24, textAlign: 'center' }}>
      <h1>管理后台</h1>
      <p>管理功能正在维护中...</p>
    </div>
  );
}

export default function App() {
  return (
    <Switch>
      <Route path="/admin" component={AdminPage} />
      <Route path="/" component={HomePage} />
    </Switch>
  );
}