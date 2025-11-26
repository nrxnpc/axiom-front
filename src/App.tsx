import React from 'react';
import { Admin, Layout, AppBar, TitlePortal, Resource, CustomRoutes } from 'react-admin';
import { Route, RouterProvider, createBrowserRouter } from 'react-router-dom';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ArticleIcon from '@mui/icons-material/Article';
import CampaignIcon from '@mui/icons-material/Campaign';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import PaymentIcon from '@mui/icons-material/Payment';
import AssessmentIcon from '@mui/icons-material/Assessment';
import FlagIcon from '@mui/icons-material/Flag';
import { authProvider } from './authProvider';
import { dataProvider } from './dataProvider';
import { LoginPage } from './LoginPage';
import { RegisterPage } from './RegisterPage';
import { Dashboard } from './Dashboard';
import { i18nProvider } from './i18nProvider';
import { CarList } from './cars/CarList';
import { CarCreate } from './cars/CarCreate';
import { CarEdit } from './cars/CarEdit';
import { ProductList } from './products/ProductList';
import { ProductCreate } from './products/ProductCreate';
import { ProductEdit } from './products/ProductEdit';
import { NewsList } from './news/NewsList';
import { NewsCreate } from './news/NewsCreate';
import { NewsEdit } from './news/NewsEdit';
import { CampaignList } from './campaigns/CampaignList';
import { CampaignCreate } from './campaigns/CampaignCreate';
import { CampaignEdit } from './campaigns/CampaignEdit';
import { AnalyticsList } from './analytics/AnalyticsList';
import { TransactionList } from './transactions/TransactionList';
import { StatisticsList } from './statistics/StatisticsList';
import { ReportList } from './reports/ReportList';
import { ReportCreate } from './reports/ReportCreate';

const MyAppBar = () => (
  <AppBar>
    <TitlePortal />
  </AppBar>
);

const MyLayout = (props: React.ComponentProps<typeof Layout>) => <Layout {...props} appBar={MyAppBar} />;

const AdminApp = () => (
  <Admin
    dataProvider={dataProvider}
    authProvider={authProvider}
    i18nProvider={i18nProvider}
    loginPage={LoginPage}
    dashboard={Dashboard}
    layout={MyLayout}
    title="Axiom Admin"
    requireAuth
  >
    <Resource
      name="cars"
      list={CarList}
      create={CarCreate}
      edit={CarEdit}
      options={{ label: 'Автомобили' }}
      icon={DirectionsCarIcon}
    />
    <Resource
      name="products"
      list={ProductList}
      create={ProductCreate}
      edit={ProductEdit}
      options={{ label: 'Товары' }}
      icon={ShoppingCartIcon}
    />
    <Resource
      name="news"
      list={NewsList}
      create={NewsCreate}
      edit={NewsEdit}
      options={{ label: 'Новости' }}
      icon={ArticleIcon}
    />
    <Resource
      name="campaigns"
      list={CampaignList}
      create={CampaignCreate}
      edit={CampaignEdit}
      options={{ label: 'Промо-кампании' }}
      icon={CampaignIcon}
    />
    <Resource
      name="company/analytics"
      list={AnalyticsList}
      options={{ label: 'Аналитика' }}
      icon={AnalyticsIcon}
    />
    <Resource
      name="user/transactions"
      list={TransactionList}
      options={{ label: 'Транзакции' }}
      icon={PaymentIcon}
    />
    <Resource
      name="statistics"
      list={StatisticsList}
      options={{ label: 'Статистика' }}
      icon={AssessmentIcon}
    />
    <Resource
      name="reports"
      list={ReportList}
      create={ReportCreate}
      options={{ label: 'Репорты' }}
      icon={FlagIcon}
    />
    <CustomRoutes noLayout>
      <Route path="/register" element={<RegisterPage />} />
    </CustomRoutes>
  </Admin>
);

function App() {
  const router = createBrowserRouter([
    {
      path: "*",
      element: <AdminApp />,
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App

