'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _boardDashboard = require('./board/Dashboard');

var _boardDashboard2 = _interopRequireDefault(_boardDashboard);

var _boardGroupAdminDashboard = require('./board/GroupAdminDashboard');

var _boardGroupAdminDashboard2 = _interopRequireDefault(_boardGroupAdminDashboard);

var _boardIssueDashboard = require('./board/IssueDashboard');

var _boardIssueDashboard2 = _interopRequireDefault(_boardIssueDashboard);

var _cardsGraphBadge = require('./cards/GraphBadge');

var _cardsGraphBadge2 = _interopRequireDefault(_cardsGraphBadge);

var _cardsGraphCard = require('./cards/GraphCard');

var _cardsGraphCard2 = _interopRequireDefault(_cardsGraphCard);

var _cardsMostActiveBadge = require('./cards/MostActiveBadge');

var _cardsMostActiveBadge2 = _interopRequireDefault(_cardsMostActiveBadge);

var _cardsRecentLogs = require('./cards/RecentLogs');

var _cardsRecentLogs2 = _interopRequireDefault(_cardsRecentLogs);

var _cardsRichLogsList = require('./cards/RichLogsList');

var _cardsRichLogsList2 = _interopRequireDefault(_cardsRichLogsList);

var _cardsQuickLinks = require('./cards/QuickLinks');

var _cardsQuickLinks2 = _interopRequireDefault(_cardsQuickLinks);

var _cardsToDoList = require('./cards/ToDoList');

var _cardsToDoList2 = _interopRequireDefault(_cardsToDoList);

var _cardsServerStatus = require('./cards/ServerStatus');

var _cardsServerStatus2 = _interopRequireDefault(_cardsServerStatus);

var _cardsWelcomePanel = require('./cards/WelcomePanel');

var _cardsWelcomePanel2 = _interopRequireDefault(_cardsWelcomePanel);

window.EnterpriseHome = {
    Dashboard: _boardDashboard2['default'],
    GroupAdminDashboard: _boardGroupAdminDashboard2['default'],
    IssueDashboard: _boardIssueDashboard2['default'],

    GraphBadge: _cardsGraphBadge2['default'],
    GraphCard: _cardsGraphCard2['default'],
    MostActiveBadge: _cardsMostActiveBadge2['default'],
    RecentLogs: _cardsRecentLogs2['default'],
    RichLogsList: _cardsRichLogsList2['default'],
    QuickLinks: _cardsQuickLinks2['default'],
    ToDoList: _cardsToDoList2['default'],
    ServerStatus: _cardsServerStatus2['default'],
    WelcomePanel: _cardsWelcomePanel2['default']

};
