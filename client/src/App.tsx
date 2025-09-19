import { Route, Switch, Redirect } from "wouter";
import DrawPage from "./pages/Draw";
import AdminEnhanced from "./pages/AdminEnhanced";

export default function App() {
  return (
    <Switch>
      <Route path="/draw" component={DrawPage} />
      <Route path="/admin" component={AdminEnhanced} />
      <Route path="/">
        {() => <Redirect to="/draw" />}
      </Route>
    </Switch>
  );
}