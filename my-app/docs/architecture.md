# Архитектура (классы / модули)

## Фронтенд (SPA)
- src/api/httpClient.ts — обёртка над fetch (credentials, timeout, /api, mock при сетевой ошибке).
- src/api/months.ts — getMonths(q), getMonth(id), addToCalculation(id).
- src/api/calculation.ts — getCart(), getCalculation(id), updateCalculation, updateItem, deleteItem.
- src/api/auth.ts — login, logout, me.
- src/components/AppNavbar.tsx — Navbar, индикатор корзины.
- src/components/Breadcrumbs.tsx — хлебные крошки для маршрутов.
- src/components/Filters.tsx — фильтр q.
- src/components/ServiceCard.tsx — карточка услуги.
- src/pages/HomeListPage.tsx — список услуг + фильтр.
- src/pages/MonthDetailPage.tsx — деталь услуги.
- src/pages/CalculationPage.tsx — заявка, редактирование полей и позиций.
- src/styles/ay.css — стили ay-*.

Зависимости страниц от API:
- HomeListPage → months.getMonths
- MonthDetailPage → months.getMonth
- CalculationPage → calculation.getCalculation, updateCalculation, updateItem, deleteItem
- Navbar → calculation.getCart

## Бэкенд (DRF)
- Модели: Months, Months_calculation, Month_indicators, CustomUser.
- Вью: MonthsViewSet, MonthsCalculationViewSet, MonthsCalculationCartView, MonthsCalculationSubmit/Finish/RejectView, MonthIndicatorsUpdate/DeleteView, login_view, logout_view, MeView, UserViewSet.
- Сериализаторы: MonthsListSerializer, MonthsCalculation{List,Detail,Update}Serializer, MonthIndicatorsSerializer, Login/Me/User.
- Авторизация: сессионная (cookies), проксируется через Vite.
