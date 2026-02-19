'use client';

import { useState, useMemo, useEffect } from 'react';

// Helper function to extract text from Atlassian Document Format (ADF)
const extractTextFromADF = (adf: any): string => {
  if (!adf || typeof adf !== 'object') return '';

  let text = '';

  const traverse = (node: any) => {
    if (!node) return;

    if (node.text) {
      text += node.text;
    }

    if (node.content && Array.isArray(node.content)) {
      node.content.forEach((child: any) => {
        traverse(child);
        // Add space between paragraphs
        if (child.type === 'paragraph') {
          text += ' ';
        }
      });
    }
  };

  traverse(adf);
  return text.trim();
};

// Enhanced demo data with all required fields

// Roles with descriptions and required skills
const DEMO_ROLES = [
  { id: '1', name: 'Frontend Developer', description: 'Develops user-facing web applications using modern frameworks like React, Vue, or Angular. Responsible for creating responsive and accessible interfaces.', requiredSkills: ['React', 'JavaScript', 'TypeScript', 'CSS', 'HTML'] },
  { id: '2', name: 'Backend Developer', description: 'Builds and maintains server-side applications, APIs, and database systems. Ensures scalability, security, and performance of backend services.', requiredSkills: ['Node.js', 'Python', 'Java', 'SQL', 'REST APIs'] },
  { id: '3', name: 'DevOps Engineer', description: 'Manages infrastructure, CI/CD pipelines, and deployment processes. Ensures reliability, monitoring, and automation of systems.', requiredSkills: ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Linux'] },
  { id: '4', name: 'Mobile Developer', description: 'Creates native or cross-platform mobile applications for iOS and Android. Focuses on mobile UX best practices and performance optimization.', requiredSkills: ['React Native', 'iOS', 'Android', 'Mobile UI/UX'] },
  { id: '5', name: 'UI Developer', description: 'Specializes in user interface design implementation, working closely with designers to create pixel-perfect, interactive experiences.', requiredSkills: ['React', 'UI/UX', 'CSS', 'Design Systems', 'Animations'] },
  { id: '6', name: 'Data Engineer', description: 'Builds data pipelines, warehouses, and analytics infrastructure. Enables data-driven decision making across the organization.', requiredSkills: ['Python', 'SQL', 'Data Pipelines', 'ETL', 'Big Data'] },
  { id: '7', name: 'QA Engineer', description: 'Ensures software quality through manual and automated testing. Creates test plans, identifies bugs, and validates fixes.', requiredSkills: ['Testing', 'Automation', 'QA Tools', 'Selenium'] },
  { id: '8', name: 'Security Engineer', description: 'Implements security best practices, conducts audits, and addresses vulnerabilities. Ensures compliance with security standards.', requiredSkills: ['Security', 'Penetration Testing', 'Compliance', 'Cryptography'] },
];

const DEMO_USERS = [
  { id: '1', name: 'Alice Johnson', role: 'admin', email: 'alice@capplanner.demo', skills: ['React', 'Node.js', 'AWS'], tempoTeam: 'Platform Team', capacity: 40 },
  { id: '2', name: 'Bob Smith', role: 'manager', email: 'bob@capplanner.demo', skills: ['Python', 'Django', 'PostgreSQL'], tempoTeam: 'Backend Team', capacity: 40 },
  { id: '3', name: 'Carol Williams', role: 'member', email: 'carol@capplanner.demo', skills: ['JavaScript', 'Vue.js', 'MongoDB'], tempoTeam: 'Frontend Team', capacity: 40 },
  { id: '4', name: 'David Brown', role: 'member', email: 'david@capplanner.demo', skills: ['Java', 'Spring Boot', 'MySQL'], tempoTeam: 'Backend Team', capacity: 40 },
  { id: '5', name: 'Emma Davis', role: 'member', email: 'emma@capplanner.demo', skills: ['TypeScript', 'React', 'GraphQL'], tempoTeam: 'Frontend Team', capacity: 40 },
  { id: '6', name: 'Frank Miller', role: 'member', email: 'frank@capplanner.demo', skills: ['Go', 'Kubernetes', 'Docker'], tempoTeam: 'DevOps Team', capacity: 40 },
  { id: '7', name: 'Grace Lee', role: 'member', email: 'grace@capplanner.demo', skills: ['C#', '.NET', 'Azure'], tempoTeam: 'Platform Team', capacity: 40 },
  { id: '8', name: 'Henry Wilson', role: 'member', email: 'henry@capplanner.demo', skills: ['Ruby', 'Rails', 'Redis'], tempoTeam: 'Backend Team', capacity: 40 },
  { id: '9', name: 'Iris Chen', role: 'member', email: 'iris@capplanner.demo', skills: ['Python', 'Data Science', 'ML'], tempoTeam: 'Data Team', capacity: 40 },
  { id: '10', name: 'Jack Thompson', role: 'member', email: 'jack@capplanner.demo', skills: ['JavaScript', 'React', 'Node.js', 'AWS'], tempoTeam: 'Frontend Team', capacity: 40 },
  { id: '11', name: 'Karen Martinez', role: 'member', email: 'karen@capplanner.demo', skills: ['Python', 'Java', 'AWS', 'Docker'], tempoTeam: 'Backend Team', capacity: 40 },
];

const DEMO_PROJECTS = [
  {
    id: '1',
    name: 'E-Commerce Platform',
    description: 'Build a scalable e-commerce platform with modern payment integration and real-time inventory management.',
    status: 'active',
    priority: 'high',
    workstream: 'Product Development',
    startDate: '2026-01-01',
    endDate: '2026-06-30',
    inServiceDate: '2026-07-01',
    owner: 'Alice Johnson',
    jiraSpace: 'ECOM',
    requiredRoles: ['Frontend Developer', 'Backend Developer', 'DevOps Engineer'],
    requiredSkills: ['React', 'Node.js', 'AWS', 'Docker']
  },
  {
    id: '2',
    name: 'Mobile App Redesign',
    description: 'Complete redesign of mobile applications for iOS and Android with improved UX and performance.',
    status: 'active',
    priority: 'critical',
    workstream: 'Product Development',
    startDate: '2026-01-15',
    endDate: '2026-04-15',
    inServiceDate: '2026-04-20',
    owner: 'Bob Smith',
    jiraSpace: 'MOBILE',
    requiredRoles: ['UI Developer', 'Mobile Developer', 'QA Engineer'],
    requiredSkills: ['React Native', 'iOS', 'Android', 'UI/UX']
  },
  {
    id: '3',
    name: 'Data Analytics Dashboard',
    description: 'Enterprise analytics dashboard for real-time business insights and reporting.',
    status: 'planned',
    priority: 'medium',
    workstream: 'Analytics & Insights',
    startDate: '2026-03-01',
    endDate: '2026-08-31',
    inServiceDate: '2026-09-15',
    owner: 'Alice Johnson',
    jiraSpace: 'DATA',
    requiredRoles: ['Data Engineer', 'Frontend Developer'],
    requiredSkills: ['Python', 'Data Science', 'React', 'SQL']
  },
  {
    id: '4',
    name: 'API Gateway Migration',
    description: 'Migrate legacy APIs to modern gateway architecture with improved security and scalability.',
    status: 'active',
    priority: 'high',
    workstream: 'Infrastructure',
    startDate: '2025-12-01',
    endDate: '2026-03-31',
    inServiceDate: '2026-04-15',
    owner: 'Bob Smith',
    jiraSpace: 'API',
    requiredRoles: ['Backend Developer', 'DevOps Engineer'],
    requiredSkills: ['Node.js', 'AWS', 'Docker', 'Kubernetes']
  },
  {
    id: '5',
    name: 'Security Audit & Compliance',
    description: 'Comprehensive security audit and compliance implementation for SOC2 and ISO27001.',
    status: 'on_hold',
    priority: 'medium',
    workstream: 'Security & Compliance',
    startDate: '2026-02-01',
    endDate: '2026-05-31',
    inServiceDate: '2026-06-01',
    owner: 'Alice Johnson',
    jiraSpace: 'SEC',
    requiredRoles: ['Security Engineer', 'Compliance Analyst'],
    requiredSkills: ['Security', 'Compliance', 'Risk Management']
  },
  {
    id: '6',
    name: 'Customer Portal',
    description: 'Self-service customer portal for account management and support.',
    status: 'planned',
    priority: 'low',
    workstream: 'Customer Experience',
    startDate: '2026-04-01',
    endDate: '2026-09-30',
    inServiceDate: '2026-10-01',
    owner: 'Bob Smith',
    jiraSpace: 'PORT',
    requiredRoles: [],
    requiredSkills: ['React', 'Node.js', 'UI/UX']
  },
];

const DEMO_ALLOCATIONS = [
  { id: '1', userId: '3', userName: 'Carol Williams', projectId: '1', projectName: 'E-Commerce Platform', startDate: '2026-01-01', endDate: '2026-06-30', percentage: 75, hoursPerWeek: 30, expectedHours: 780, role: 'Frontend Developer', tempoTeam: 'Frontend Team', tempoAccount: 'Engineering' },
  { id: '2', userId: '4', userName: 'David Brown', projectId: '4', projectName: 'API Gateway Migration', startDate: '2025-12-01', endDate: '2026-03-31', percentage: 100, hoursPerWeek: 40, expectedHours: 680, role: 'Backend Developer', tempoTeam: 'Backend Team', tempoAccount: 'Engineering' },
  { id: '3', userId: '5', userName: 'Emma Davis', projectId: '1', projectName: 'E-Commerce Platform', startDate: '2026-01-01', endDate: '2026-06-30', percentage: 50, hoursPerWeek: 20, expectedHours: 520, role: 'Frontend Developer', tempoTeam: 'Frontend Team', tempoAccount: 'Engineering' },
  { id: '4', userId: '5', userName: 'Emma Davis', projectId: '2', projectName: 'Mobile App Redesign', startDate: '2026-01-15', endDate: '2026-04-15', percentage: 60, hoursPerWeek: 24, expectedHours: 312, role: 'UI Developer', tempoTeam: 'Frontend Team', tempoAccount: 'Engineering' },
  { id: '5', userId: '6', userName: 'Frank Miller', projectId: '4', projectName: 'API Gateway Migration', startDate: '2025-12-01', endDate: '2026-03-31', percentage: 100, hoursPerWeek: 40, expectedHours: 680, role: 'DevOps Engineer', tempoTeam: 'DevOps Team', tempoAccount: 'Infrastructure' },
  { id: '6', userId: '7', userName: 'Grace Lee', projectId: '2', projectName: 'Mobile App Redesign', startDate: '2026-01-15', endDate: '2026-04-15', percentage: 75, hoursPerWeek: 30, expectedHours: 390, role: 'Mobile Developer', tempoTeam: 'Platform Team', tempoAccount: 'Engineering' },
  { id: '7', userId: '8', userName: 'Henry Wilson', projectId: '1', projectName: 'E-Commerce Platform', startDate: '2026-02-01', endDate: '2026-06-30', percentage: 60, hoursPerWeek: 24, expectedHours: 504, role: 'Backend Developer', tempoTeam: 'Backend Team', tempoAccount: 'Engineering' },
  { id: '8', userId: '9', userName: 'Iris Chen', projectId: '3', projectName: 'Data Analytics Dashboard', startDate: '2026-03-01', endDate: '2026-08-31', percentage: 80, hoursPerWeek: 32, expectedHours: 832, role: 'Data Engineer', tempoTeam: 'Data Team', tempoAccount: 'Analytics' },
  { id: '9', userId: '10', userName: 'Jack Thompson', projectId: '1', projectName: 'E-Commerce Platform', startDate: '2026-01-01', endDate: '2026-06-30', percentage: 75, hoursPerWeek: 30, expectedHours: 780, role: 'Frontend Developer', tempoTeam: 'Frontend Team', tempoAccount: 'Engineering' },
  { id: '10', userId: '10', userName: 'Jack Thompson', projectId: '2', projectName: 'Mobile App Redesign', startDate: '2026-01-15', endDate: '2026-04-15', percentage: 50, hoursPerWeek: 20, expectedHours: 260, role: 'Frontend Developer', tempoTeam: 'Frontend Team', tempoAccount: 'Engineering' },
  { id: '11', userId: '11', userName: 'Karen Martinez', projectId: '4', projectName: 'API Gateway Migration', startDate: '2025-12-01', endDate: '2026-03-31', percentage: 80, hoursPerWeek: 32, expectedHours: 544, role: 'Backend Developer', tempoTeam: 'Backend Team', tempoAccount: 'Engineering' },
  { id: '12', userId: '11', userName: 'Karen Martinez', projectId: '1', projectName: 'E-Commerce Platform', startDate: '2026-01-01', endDate: '2026-06-30', percentage: 40, hoursPerWeek: 16, expectedHours: 416, role: 'Backend Developer', tempoTeam: 'Backend Team', tempoAccount: 'Engineering' },
  { id: '13', userId: '4', userName: 'David Brown', projectId: '5', projectName: 'Security Audit & Compliance', startDate: '2026-02-01', endDate: '2026-05-31', percentage: 0, hoursPerWeek: 0, expectedHours: 0, role: 'Security Engineer', tempoTeam: 'Backend Team', tempoAccount: 'Engineering' },
];

// Demo Tempo actuals data
const DEMO_TEMPO_ACTUALS = [
  { userId: '3', userName: 'Carol Williams', projectId: '1', week: '2026-01-01', plannedHours: 30, actualHours: 28, role: 'Frontend Developer', account: 'CapEx' },
  { userId: '3', userName: 'Carol Williams', projectId: '1', week: '2026-01-08', plannedHours: 30, actualHours: 32, role: 'Frontend Developer', account: 'CapEx' },
  { userId: '4', userName: 'David Brown', projectId: '4', week: '2026-01-01', plannedHours: 40, actualHours: 42, role: 'Backend Developer', account: 'OpEx' },
  { userId: '5', userName: 'Emma Davis', projectId: '1', week: '2026-01-01', plannedHours: 20, actualHours: 18, role: 'Frontend Developer', account: 'CapEx' },
  { userId: '5', userName: 'Emma Davis', projectId: '2', week: '2026-01-15', plannedHours: 24, actualHours: 26, role: 'UI Developer', account: 'CapEx' },
  { userId: '6', userName: 'Frank Miller', projectId: '4', week: '2026-01-01', plannedHours: 40, actualHours: 40, role: 'DevOps Engineer', account: 'OpEx' },
  { userId: '7', userName: 'Grace Lee', projectId: '2', week: '2026-01-15', plannedHours: 30, actualHours: 29, role: 'Mobile Developer', account: 'CapEx' },
  { userId: '8', userName: 'Henry Wilson', projectId: '1', week: '2026-02-01', plannedHours: 24, actualHours: 22, role: 'Backend Developer', account: 'CapEx' },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState('projects');
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string; roles: string[] }>({ name: '', email: '', roles: [] });
  const [editingAllocation, setEditingAllocation] = useState<{ projectId: string; role: string } | null>(null);
  const [editModalData, setEditModalData] = useState({ userId: '', startDate: '', endDate: '', expectedHours: 0 });

  // Assignments (formerly Allocations) filters
  const [assignmentsFilters, setAssignmentsFilters] = useState({
    tempoTeam: [] as string[],
    role: [] as string[],
    user: [] as string[],
    account: [] as string[],
    dateFrom: '',
    dateTo: '',
    capacityLevel: 'all',
    skill: [] as string[],
    showZeroPercent: false,
    jiraSpace: [] as string[]
  });

  // Column visibility for Assignments tab
  const [visibleColumns, setVisibleColumns] = useState({
    member: true,
    tempoTeam: true,
    capacity: true,
    project: true,
    role: true,
    account: true,
    period: true,
    allocation: true
  });

  const [showColumnMenu, setShowColumnMenu] = useState(false);

  // Dropdown menu states for filters
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});

  // Excel-style filter mode
  const [excelFilterMode, setExcelFilterMode] = useState(true);
  const [dropdownSearches, setDropdownSearches] = useState<Record<string, string>>({});
  const [dropdownSortOrders, setDropdownSortOrders] = useState<Record<string, 'asc' | 'desc'>>({});

  // Members filters
  const [membersFilter, setMembersFilter] = useState({
    overCapacity: false,
    dateFrom: '',
    dateTo: '',
    skill: [] as string[],
    user: '',
    tempoTeam: [] as string[],
    jiraSpace: [] as string[]
  });
  const [expandedMember, setExpandedMember] = useState<string | null>(null);
  const [showNewAllocationModal, setShowNewAllocationModal] = useState(false);
  const [showSkillsModal, setShowSkillsModal] = useState(false);
  const [selectedUserForSkills, setSelectedUserForSkills] = useState<string | null>(null);

  // Timeline filters
  const [timelineFilters, setTimelineFilters] = useState({
    priority: [] as string[],
    workstream: [] as string[],
    tempoTeam: [] as string[],
    role: [] as string[],
    status: [] as string[],
    missingRoles: false,
    skill: [] as string[],
    user: '',
    dateFrom: '2026-01-01',
    dateTo: '2026-12-31',
    jiraSpace: [] as string[]
  });
  const [expandedProjects, setExpandedProjects] = useState<string[]>([]);
  const [timelineViewMode, setTimelineViewMode] = useState<'weekly' | 'monthly' | 'quarterly' | 'yearly'>('monthly');

  // Projects filters
  const [projectsFilter, setProjectsFilter] = useState({
    noRoles: false,
    missingAssignees: false,
    role: [] as string[],
    priority: [] as string[],
    status: [] as string[],
    dateFrom: '',
    dateTo: '',
    skill: [] as string[],
    owner: [] as string[],
    workstream: [] as string[],
    jiraSpace: [] as string[],
    initiativeOnly: false
  });
  const [projectsSearch, setProjectsSearch] = useState('');
  const [projectsFiltersCollapsed, setProjectsFiltersCollapsed] = useState(false);

  // Actuals tab filters
  const [actualsFilters, setActualsFilters] = useState({
    dateFrom: '',
    dateTo: '',
    role: '',
    user: '',
    account: '',
    jiraSpace: [] as string[]
  });

  // Role management modal state
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedProjectForRoles, setSelectedProjectForRoles] = useState<string | null>(null);
  const [newRoleName, setNewRoleName] = useState('');

  // Project editing state
  const [editingProjectDetails, setEditingProjectDetails] = useState<string | null>(null);
  const [projectDetailsData, setProjectDetailsData] = useState({
    description: '',
    owner: '',
    businessOwner: '',
    workstream: '',
    par: '',
    startDate: '',
    endDate: '',
    inserviceDate: '',
    businessValue: '',
    capitalExpense: '',
    healthStatus: ''
  });
  const [jiraUsers, setJiraUsers] = useState<any[]>([]);
  const [loadingJiraUsers, setLoadingJiraUsers] = useState(false);
  const [fieldMetadata, setFieldMetadata] = useState<any>({});
  const [loadingFieldMetadata, setLoadingFieldMetadata] = useState(false);
  const [availableTransitions, setAvailableTransitions] = useState<any[]>([]);
  const [loadingTransitions, setLoadingTransitions] = useState(false);
  const [showTransitionModal, setShowTransitionModal] = useState(false);
  const [savingChanges, setSavingChanges] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Project skills modal state
  const [showProjectSkillsModal, setShowProjectSkillsModal] = useState(false);
  const [selectedProjectForSkills, setSelectedProjectForSkills] = useState<string | null>(null);
  const [newSkillName, setNewSkillName] = useState('');

  // Manage projects data as state so we can update it
  const [projects, setProjects] = useState<any[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [projectsError, setProjectsError] = useState<string | null>(null);

  // Jira epics/initiatives state
  const [jiraEpics, setJiraEpics] = useState<any[]>([]);
  const [loadingEpics, setLoadingEpics] = useState(false);
  const [epicsError, setEpicsError] = useState<string | null>(null);
  const [showInfoBox, setShowInfoBox] = useState(true);

  // Roles management state
  const [roles, setRoles] = useState(DEMO_ROLES);
  const [showAddEditRoleModal, setShowAddEditRoleModal] = useState(false);
  const [editingRole, setEditingRole] = useState<{ id: string; name: string; description: string; requiredSkills: string[] } | null>(null);
  const [roleFormData, setRoleFormData] = useState({ name: '', description: '', requiredSkills: [] as string[] });

  // Admin tab - Field mappings state
  const [selectedMappingEntity, setSelectedMappingEntity] = useState('project');
  const [fieldMappings, setFieldMappings] = useState<any[]>([]);
  const [mappingsLoaded, setMappingsLoaded] = useState(false);

  // Admin tab - Skills management state
  const [showSkillsManagementModal, setShowSkillsManagementModal] = useState(false);
  const [editingSkill, setEditingSkill] = useState<string | null>(null);
  const [skillFormData, setSkillFormData] = useState('');
  const [showDeleteSkillModal, setShowDeleteSkillModal] = useState(false);
  const [skillToDelete, setSkillToDelete] = useState<string | null>(null);

  // Role deletion confirmation state
  const [showDeleteRoleModal, setShowDeleteRoleModal] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<{ id: string; name: string } | null>(null);

  // API connection state
  const [jiraCredentials, setJiraCredentials] = useState({ baseUrl: '', email: '', apiToken: '' });
  const [tempoCredentials, setTempoCredentials] = useState({ apiToken: '' });
  const [jiraConnectionStatus, setJiraConnectionStatus] = useState<string | null>(null);
  const [tempoConnectionStatus, setTempoConnectionStatus] = useState<string | null>(null);
  const [testingJiraConnection, setTestingJiraConnection] = useState(false);
  const [testingTempoConnection, setTestingTempoConnection] = useState(false);

  /**
   * CAPACITY AND ALLOCATION DEFINITIONS:
   * - Capacity: How many hours one member can do within a 40-hour week
   * - Allocation: How many projects they are assigned to at a given time
   */

  const statusColors: Record<string, string> = {
    // Jira statuses (transformed with .toLowerCase().replace(/\s+/g, '_'))
    run_the_business: 'bg-blue-200 text-blue-800',
    in_progress: 'bg-blue-200 text-blue-800',
    to_do: 'bg-slate-200 text-slate-800',
    planned: 'bg-gray-300 text-gray-900',
    active: 'bg-green-200 text-green-800',
    active_project: 'bg-green-200 text-green-800',
    discovery: 'bg-purple-200 text-purple-800',
    prioritized: 'bg-indigo-200 text-indigo-800',
    backlog: 'bg-gray-300 text-gray-900',
    on_hold: 'bg-amber-200 text-amber-900',
    blocked: 'bg-orange-200 text-orange-900',
    in_review: 'bg-purple-200 text-purple-800',
    done: 'bg-emerald-200 text-emerald-800',
    completed: 'bg-indigo-200 text-indigo-800',
    cancelled: 'bg-red-200 text-red-800',
    new_request: 'bg-cyan-200 text-cyan-800',
    closed: 'bg-gray-400 text-gray-900',
  };

  const statusDisplayNames: Record<string, string> = {
    active_project: 'Active Project',
    discovery: 'Discovery',
    run_the_business: 'Run the Business',
    prioritized: 'Prioritized',
    done: 'Done',
    backlog: 'Backlog',
    on_hold: 'On Hold',
    in_progress: 'In Progress',
    cancelled: 'Cancelled',
    new_request: 'New Request',
    to_do: 'To Do',
    planned: 'Planned',
    active: 'Active',
    blocked: 'Blocked',
    in_review: 'In Review',
    completed: 'Completed',
    closed: 'Closed',
  };

  const roleColors: Record<string, string> = {
    admin: 'bg-purple-100 text-purple-700',
    manager: 'bg-blue-100 text-blue-700',
    member: 'bg-green-100 text-green-700',
    viewer: 'bg-gray-100 text-gray-700',
  };

  // Calculate capacity color for dots
  const getCapacityDotColor = (percentage: number) => {
    if (percentage >= 101) return 'bg-red-500';
    return 'bg-green-500';
  };

  // Calculate capacity color for bars
  const getCapacityColor = (percentage: number) => {
    if (percentage >= 101) return 'bg-red-500';
    return 'bg-green-500';
  };

  // Calculate user capacity based on current date (2026-01-07)
  const getCurrentCapacity = (userId: string, dateFrom?: string, dateTo?: string) => {
    const currentDate = '2026-01-07';
    const userAllocations = DEMO_ALLOCATIONS.filter(a => {
      if (a.userId !== userId) return false;
      if (dateFrom && a.endDate < dateFrom) return false;
      if (dateTo && a.startDate > dateTo) return false;
      // Only include if allocation is active on current date
      return a.startDate <= currentDate && a.endDate >= currentDate;
    });
    return userAllocations.reduce((sum, a) => sum + a.percentage, 0);
  };

  // Sorted assignments with over-capacity users first
  const sortedAssignments = useMemo(() => {
    const filtered = DEMO_ALLOCATIONS.filter(alloc => {
      if (assignmentsFilters.tempoTeam.length > 0 && !assignmentsFilters.tempoTeam.includes(alloc.tempoTeam)) return false;
      if (assignmentsFilters.role.length > 0 && !assignmentsFilters.role.includes(alloc.role)) return false;
      if (assignmentsFilters.user.length > 0 && !assignmentsFilters.user.includes(alloc.userName)) return false;
      if (assignmentsFilters.account.length > 0 && !assignmentsFilters.account.includes(alloc.tempoAccount)) return false;
      if (assignmentsFilters.dateFrom && alloc.endDate < assignmentsFilters.dateFrom) return false;
      if (assignmentsFilters.dateTo && alloc.startDate > assignmentsFilters.dateTo) return false;

      if (assignmentsFilters.capacityLevel !== 'all') {
        const capacity = getCurrentCapacity(alloc.userId);
        if (assignmentsFilters.capacityLevel === 'over' && capacity <= 100) return false;
        if (assignmentsFilters.capacityLevel === 'under' && capacity >= 100) return false;
      }

      if (assignmentsFilters.showZeroPercent && alloc.hoursPerWeek !== 0) return false;

      if (assignmentsFilters.skill.length > 0) {
        const user = DEMO_USERS.find(u => u.id === alloc.userId);
        if (!user || !assignmentsFilters.skill.some(skill => user.skills.includes(skill))) return false;
      }

      return true;
    });

    // Sort by capacity (over-capacity first)
    return filtered.sort((a, b) => {
      const capacityA = getCurrentCapacity(a.userId);
      const capacityB = getCurrentCapacity(b.userId);
      if (capacityA >= 101 && capacityB < 101) return -1;
      if (capacityA < 101 && capacityB >= 101) return 1;
      return capacityB - capacityA;
    });
  }, [assignmentsFilters]);

  // Filtered members
  const filteredMembers = useMemo(() => {
    return DEMO_USERS.filter(user => {
      const capacity = getCurrentCapacity(user.id, membersFilter.dateFrom, membersFilter.dateTo);
      if (membersFilter.overCapacity && capacity <= 100) return false;
      if (membersFilter.skill.length > 0 && !membersFilter.skill.some(skill => user.skills.includes(skill))) return false;
      if (membersFilter.user && !user.name.toLowerCase().includes(membersFilter.user.toLowerCase())) return false;
      if (membersFilter.tempoTeam.length > 0 && !membersFilter.tempoTeam.includes(user.tempoTeam)) return false;
      return true;
    });
  }, [membersFilter]);

  // Filtered projects for timeline
  const filteredTimelineProjects = useMemo(() => {
    // Use jiraEpics when filtering by Jira projects, otherwise use projects
    const sourceProjects = timelineFilters.jiraSpace.length > 0 ? jiraEpics : projects;

    return sourceProjects.filter(project => {
      if (timelineFilters.priority.length > 0 && !timelineFilters.priority.includes(project.priority)) return false;
      if (timelineFilters.workstream.length > 0 && !timelineFilters.workstream.includes(project.workstream)) return false;
      if (timelineFilters.status.length > 0 && !timelineFilters.status.includes(project.status)) return false;
      // jiraSpace filtering is handled by sourceProjects selection

      // Filter by date range
      if (timelineFilters.dateFrom && project.endDate < timelineFilters.dateFrom) return false;
      if (timelineFilters.dateTo && project.startDate > timelineFilters.dateTo) return false;

      if (timelineFilters.tempoTeam.length > 0 || timelineFilters.role.length > 0 || timelineFilters.skill.length > 0 || timelineFilters.user) {
        const projectAllocs = DEMO_ALLOCATIONS.filter(a => {
          if (a.projectId !== project.id) return false;
          if (timelineFilters.tempoTeam.length > 0 && !timelineFilters.tempoTeam.includes(a.tempoTeam)) return false;
          if (timelineFilters.role.length > 0 && !timelineFilters.role.includes(a.role)) return false;
          if (timelineFilters.user && !a.userName.toLowerCase().includes(timelineFilters.user.toLowerCase())) return false;
          if (timelineFilters.skill.length > 0) {
            const user = DEMO_USERS.find(u => u.id === a.userId);
            if (!user || !timelineFilters.skill.some(skill => user.skills.includes(skill))) return false;
          }
          return true;
        });
        if (projectAllocs.length === 0) return false;
      }

      if (timelineFilters.missingRoles) {
        const projectAllocations = DEMO_ALLOCATIONS.filter(a => a.projectId === project.id);
        const filledRoles = projectAllocations.map(a => a.role);
        const missingRoles = project.requiredRoles.filter((r: string) => !filledRoles.includes(r));
        if (missingRoles.length === 0 && project.requiredRoles.length > 0) return false;
      }

      return true;
    });
  }, [timelineFilters, projects, jiraEpics]);

  // Filtered projects for projects tab
  const filteredProjects = useMemo(() => {
    // Use jiraEpics when filtering by Jira projects OR when initiativeOnly is checked
    const sourceProjects = (projectsFilter.jiraSpace.length > 0 || projectsFilter.initiativeOnly) ? jiraEpics : projects;

    return sourceProjects.filter(project => {
      if (projectsFilter.noRoles && project.requiredRoles.length > 0) return false;
      if (projectsFilter.role.length > 0) {
        if (!projectsFilter.role.some(role => project.requiredRoles.includes(role))) return false;
      }
      if (projectsFilter.priority.length > 0 && !projectsFilter.priority.includes(project.priority)) return false;
      if (projectsFilter.status.length > 0 && !projectsFilter.status.includes(project.status)) return false;
      if (projectsFilter.owner.length > 0 && !projectsFilter.owner.includes(project.owner)) return false;
      if (projectsFilter.workstream.length > 0 && !projectsFilter.workstream.includes(project.workstream)) return false;
      // jiraSpace filtering is handled by sourceProjects selection
      if (projectsFilter.dateFrom && project.endDate && project.endDate < projectsFilter.dateFrom) return false;
      if (projectsFilter.dateTo && project.startDate && project.startDate > projectsFilter.dateTo) return false;

      if (projectsFilter.missingAssignees) {
        const projectAllocations = DEMO_ALLOCATIONS.filter(a => a.projectId === project.id);
        const filledRoles = projectAllocations.map(a => a.role);
        const missingRoles = project.requiredRoles.filter((r: string) => !filledRoles.includes(r));
        if (missingRoles.length === 0) return false;
      }

      if (projectsFilter.skill.length > 0) {
        const projectAllocations = DEMO_ALLOCATIONS.filter(a => a.projectId === project.id);
        const hasSkill = projectAllocations.some(alloc => {
          const user = DEMO_USERS.find(u => u.id === alloc.userId);
          return user && projectsFilter.skill.some(skill => user.skills.includes(skill));
        });
        if (!hasSkill) return false;
      }

      // Search filter
      if (projectsSearch.trim()) {
        const searchLower = projectsSearch.toLowerCase();
        const matchesSearch =
          project.name.toLowerCase().includes(searchLower) ||
          (project.description && project.description.toLowerCase().includes(searchLower)) ||
          (project.owner && project.owner.toLowerCase().includes(searchLower)) ||
          (project.workstream && project.workstream.toLowerCase().includes(searchLower)) ||
          ((project as any).businessOwner && (project as any).businessOwner.toLowerCase().includes(searchLower)) ||
          ((project as any).par && (project as any).par.toLowerCase().includes(searchLower));
        if (!matchesSearch) return false;
      }

      return true;
    });
  }, [projectsFilter, projectsSearch, projects, jiraEpics]);

  // Filtered actuals data
  const filteredActuals = useMemo(() => {
    return DEMO_TEMPO_ACTUALS.filter(actual => {
      if (actualsFilters.dateFrom && actual.week < actualsFilters.dateFrom) return false;
      if (actualsFilters.dateTo && actual.week > actualsFilters.dateTo) return false;
      if (actualsFilters.role && actual.role !== actualsFilters.role) return false;
      if (actualsFilters.user && actual.userName !== actualsFilters.user) return false;
      if (actualsFilters.account && actual.account !== actualsFilters.account) return false;
      return true;
    });
  }, [actualsFilters]);

  // Calculate actuals summary for charts
  const actualsSummary = useMemo(() => {
    const totalPlanned = filteredActuals.reduce((sum, a) => sum + a.plannedHours, 0);
    const totalActual = filteredActuals.reduce((sum, a) => sum + a.actualHours, 0);
    const variance = totalActual - totalPlanned;
    const variancePercent = totalPlanned > 0 ? ((variance / totalPlanned) * 100).toFixed(1) : 0;

    // Group by role for pie chart
    const byRole: Record<string, { planned: number; actual: number }> = {};
    filteredActuals.forEach(a => {
      if (!byRole[a.role]) byRole[a.role] = { planned: 0, actual: 0 };
      byRole[a.role].planned += a.plannedHours;
      byRole[a.role].actual += a.actualHours;
    });

    // Group by user
    const byUser: Record<string, { planned: number; actual: number }> = {};
    filteredActuals.forEach(a => {
      if (!byUser[a.userName]) byUser[a.userName] = { planned: 0, actual: 0 };
      byUser[a.userName].planned += a.plannedHours;
      byUser[a.userName].actual += a.actualHours;
    });

    return { totalPlanned, totalActual, variance, variancePercent, byRole, byUser };
  }, [filteredActuals]);

  // Get unique values for filters
  const uniqueTempoTeams = [...new Set(DEMO_ALLOCATIONS.map(a => a.tempoTeam))];
  const uniqueRoles = [...new Set(DEMO_ALLOCATIONS.map(a => a.role))];
  const uniqueUsers = [...new Set(DEMO_ALLOCATIONS.map(a => a.userName))];
  const uniqueAccounts = [...new Set(DEMO_ALLOCATIONS.map(a => a.tempoAccount))];
  // Combine workstreams from both demo projects and Jira epics
  const uniqueWorkstreams = [...new Set([
    ...projects.map(p => p.workstream),
    ...jiraEpics.map(e => e.workstream)
  ])].filter(w => w).sort((a, b) => {
    // Put "Uncategorized" at the end
    if (a === 'Uncategorized') return 1;
    if (b === 'Uncategorized') return -1;
    return a.localeCompare(b);
  });
  const uniqueOwners = [...new Set(projects.map(p => p.owner))].sort();
  const uniquePriorities = ['low', 'medium', 'high', 'critical'];
  const uniqueSkills = [...new Set(DEMO_USERS.flatMap(u => u.skills))].sort();
  // Predefined status list for dropdown
  const uniqueStatuses = [
    'active_project',
    'discovery',
    'run_the_business',
    'prioritized',
    'done',
    'backlog',
    'on_hold',
    'in_progress',
    'cancelled',
    'new_request'
  ];
  // Helper function to clean up project display names
  const getProjectDisplayName = (projectName: string, simplified = false) => {
    // Map specific project names to display names
    const displayNameMap: Record<string, string> = {
      'Product (Business)': 'Product',
      'IT Portfolio Management': simplified ? 'IT Portfolio Management' : 'IT Portfolio Management (ITPM)',
      'Research & Development': 'Research & Development'
    };

    // Return mapped name if exists, otherwise remove " (Business)" suffix
    return displayNameMap[projectName] || projectName.replace(/\s*\(Business\)\s*$/i, '');
  };

  // Create unique projects list with ID and Name for dropdown
  const uniqueJiraProjects = (projects || []).map(p => ({ id: p.id, name: getProjectDisplayName(p.name) }))
    .filter((p, index, self) => index === self.findIndex((t) => t.id === p.id))
    .sort((a, b) => a.name.localeCompare(b.name));

  // Helper function to get skill associations
  const getSkillAssociations = (skill: string) => {
    const associatedUsers = DEMO_USERS.filter(u => u.skills.includes(skill));
    const associatedProjects = projects.filter(p => p.requiredSkills?.includes(skill));
    const associatedRoles = roles.filter(r => r.requiredSkills.includes(skill));
    return { users: associatedUsers, projects: associatedProjects, roles: associatedRoles };
  };

  // Helper function to get role associations
  const getRoleAssociations = (roleName: string) => {
    const associatedAllocations = DEMO_ALLOCATIONS.filter(a => a.role === roleName);
    const uniqueProjectIds = [...new Set(associatedAllocations.map(a => a.projectId))];
    const associatedProjects = projects.filter(p => uniqueProjectIds.includes(p.id));
    const uniqueUserIds = [...new Set(associatedAllocations.map(a => a.userId))];
    const associatedUsers = DEMO_USERS.filter(u => uniqueUserIds.includes(u.id));
    return { allocations: associatedAllocations, projects: associatedProjects, users: associatedUsers };
  };

  const toggleProjectExpansion = (projectId: string) => {
    setExpandedProjects(prev =>
      prev.includes(projectId) ? prev.filter(id => id !== projectId) : [...prev, projectId]
    );
  };

  const toggleDropdown = (dropdownId: string) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [dropdownId]: !prev[dropdownId]
    }));
  };

  // Excel-style filter helper functions
  const updateDropdownSearch = (dropdownId: string, value: string) => {
    setDropdownSearches(prev => ({ ...prev, [dropdownId]: value }));
  };

  const toggleDropdownSort = (dropdownId: string) => {
    setDropdownSortOrders(prev => ({
      ...prev,
      [dropdownId]: prev[dropdownId] === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getFilteredAndSortedOptions = <T extends string | { id: string; name: string }>(
    dropdownId: string,
    options: T[],
    getDisplayValue: (item: T) => string = (item) => typeof item === 'string' ? item : (item as { name: string }).name
  ): T[] => {
    const searchTerm = (dropdownSearches[dropdownId] || '').toLowerCase();
    const sortOrder = dropdownSortOrders[dropdownId] || 'asc';

    let filtered = options;
    if (searchTerm) {
      filtered = options.filter(item =>
        getDisplayValue(item).toLowerCase().includes(searchTerm)
      );
    }

    return [...filtered].sort((a, b) => {
      const aVal = getDisplayValue(a).toLowerCase();
      const bVal = getDisplayValue(b).toLowerCase();
      return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    });
  };

  // Fetch current user on mount
  useEffect(() => {
    fetch('/api/me')
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to fetch user: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        setCurrentUser({
          name: data.name || 'Anonymous',
          email: data.email || '',
          roles: Array.isArray(data.roles) ? data.roles : [],
        });
      })
      .catch(error => {
        console.error('Failed to fetch current user:', error);
      });
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      // Check if click is outside all dropdowns
      const isClickInsideDropdown = target.closest('.dropdown-container') ||
                                     target.closest('button[data-dropdown]');

      if (!isClickInsideDropdown) {
        // Close all dropdowns
        setOpenDropdowns({});
      }
    };

    // Add event listener
    document.addEventListener('mousedown', handleClickOutside);

    // Cleanup
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch projects from Jira on component mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoadingProjects(true);
        setProjectsError(null);
        const response = await fetch('/api/admin/projects');
        const data = await response.json();

        if (data.success && data.projects) {
          // Transform Jira projects to match the application's project structure
          const transformedProjects = data.projects.map((project: any) => ({
            id: project.id,
            name: project.name,
            description: project.description || '',
            status: 'active', // Default status, can be determined by project state
            priority: 'medium', // Default priority
            workstream: project.category || 'Uncategorized',
            startDate: '', // Will need to be fetched from project details or set manually
            endDate: '',
            inServiceDate: '',
            owner: project.lead || '',
            jiraSpace: project.key,
            requiredRoles: [],
            requiredSkills: []
          }));
          setProjects(transformedProjects);
        } else {
          setProjectsError(data.message || 'Failed to fetch projects');
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
        setProjectsError('Failed to connect to API');
      } finally {
        setLoadingProjects(false);
      }
    };

    fetchProjects();
  }, []);

  // Fetch epics/initiatives when Jira project filter changes
  useEffect(() => {
    const fetchEpics = async () => {
      // Combine Jira project selections from both Projects and Timeline tabs
      const combinedJiraProjects = [...new Set([...projectsFilter.jiraSpace, ...timelineFilters.jiraSpace])];

      // Only fetch epics when specific Jira projects are selected OR initiativeOnly is checked
      if (combinedJiraProjects.length === 0 && !projectsFilter.initiativeOnly) {
        setJiraEpics([]);
        return;
      }

      try {
        setLoadingEpics(true);
        setEpicsError(null);

        // Fetch epics for each project
        const allEpics: any[] = [];

        // Get selected projects (all projects if initiativeOnly and no specific selection)
        const projectsToFetch = combinedJiraProjects.length > 0
          ? (projects || []).filter(p => combinedJiraProjects.includes(p.id))
          : (projects || []); // Fetch from all projects when initiativeOnly is checked

        for (const project of projectsToFetch) {
          // Skip if project doesn't have a jiraSpace key
          if (!project.jiraSpace) continue;

          const response = await fetch(
            `/api/admin/projects/${project.jiraSpace}/epics?initiativeOnly=${projectsFilter.initiativeOnly}`
          );
          const data = await response.json();

          if (data.success && data.epics) {
            // Transform epics to match project card structure
            const transformedEpics = data.epics.map((epic: any) => {
              // Extract text from Atlassian Document Format (ADF) if description is an object
              let description = '';
              if (epic.description) {
                if (typeof epic.description === 'string') {
                  description = epic.description;
                } else if (typeof epic.description === 'object') {
                  // ADF format - extract text from content nodes
                  description = extractTextFromADF(epic.description);
                }
              }

              return {
                id: epic.key,
                name: epic.summary,
                description,
                status: epic.status.toLowerCase().replace(/\s+/g, '_'),
                priority: epic.priority ? epic.priority.toLowerCase() : 'medium',
                workstream: epic.workstream || project.name, // Use Jira workstream field, fallback to parent project name
                startDate: epic.startDate || (epic.created ? new Date(epic.created).toISOString().split('T')[0] : ''),
                endDate: epic.endDate || epic.duedate || '',
                inServiceDate: epic.inserviceDate || epic.duedate || '',
                owner: epic.owner || epic.assignee || '', // Use IT Owner field, fallback to assignee
                businessOwner: epic.businessOwner || '', // Business Champion(s) field
                par: epic.par || '', // PAR # field
                healthStatus: epic.healthStatus || '', // Health Status field (Green/Yellow/Red)
                businessValue: epic.businessValue || '', // Business Value field
                capitalExpense: epic.capitalExpense || '', // Capital/Expense field
                jiraSpace: project.jiraSpace,
                jiraKey: epic.key,
                issueType: epic.issueType,
                requiredRoles: [],
                requiredSkills: []
              };
            });
            allEpics.push(...transformedEpics);
          }
        }

        setJiraEpics(allEpics);
      } catch (error) {
        console.error('Error fetching epics:', error);
        setEpicsError('Failed to fetch epics');
      } finally {
        setLoadingEpics(false);
      }
    };

    fetchEpics();
  }, [projectsFilter.jiraSpace, projectsFilter.initiativeOnly, timelineFilters.jiraSpace, projects]);

  // Fetch Jira users when editing a Jira project
  useEffect(() => {
    const fetchJiraUsers = async () => {
      if (!editingProjectDetails) {
        setJiraUsers([]);
        return;
      }

      const currentProject = projects.find(p => p.id === editingProjectDetails);
      if (!currentProject || !currentProject.jiraSpace) {
        return;
      }

      try {
        setLoadingJiraUsers(true);
        const response = await fetch(`/api/admin/projects/${currentProject.jiraSpace}/users`);
        const data = await response.json();

        if (data.success) {
          setJiraUsers(data.users);
        }
      } catch (error) {
        console.error('Failed to fetch Jira users:', error);
      } finally {
        setLoadingJiraUsers(false);
      }
    };

    fetchJiraUsers();
  }, [editingProjectDetails, projects]);

  // Fetch field metadata when editing a Jira project
  useEffect(() => {
    const fetchFieldMetadata = async () => {
      if (!editingProjectDetails) {
        setFieldMetadata({});
        return;
      }

      const allProjects = projectsFilter.jiraSpace.length > 0 ? jiraEpics : projects;
      const currentProject = allProjects.find(p => p.id === editingProjectDetails);
      if (!currentProject || !currentProject.jiraKey) {
        console.log('No Jira project found or no jiraKey');
        return;
      }

      // Extract project key from jiraKey (e.g., ITPM-123 -> ITPM)
      const projectKey = currentProject.jiraKey.split('-')[0];

      try {
        setLoadingFieldMetadata(true);
        console.log(`Fetching field metadata for project ${projectKey}`);
        const response = await fetch(`/api/admin/projects/${projectKey}/field-metadata`);
        const data = await response.json();

        console.log('Field metadata response:', data);

        if (data.success) {
          setFieldMetadata(data.fields);
          console.log('Field metadata loaded:', data.fields);
        } else {
          console.warn('Field metadata fetch failed:', data.message);
        }
      } catch (error) {
        console.error('Failed to fetch field metadata:', error);
      } finally {
        setLoadingFieldMetadata(false);
      }
    };

    fetchFieldMetadata();
  }, [editingProjectDetails, projects, jiraEpics, projectsFilter.jiraSpace]);

  // Fetch available transitions when editing a Jira project
  useEffect(() => {
    const fetchTransitions = async () => {
      if (!editingProjectDetails) {
        setAvailableTransitions([]);
        return;
      }

      const allProjects = projectsFilter.jiraSpace.length > 0 ? jiraEpics : projects;
      const currentProject = allProjects.find(p => p.id === editingProjectDetails);
      if (!currentProject || !currentProject.jiraKey) {
        return;
      }

      try {
        setLoadingTransitions(true);
        const response = await fetch(`/api/admin/issues/${currentProject.jiraKey}/transitions`);
        const data = await response.json();

        if (data.success) {
          setAvailableTransitions(data.transitions);
        }
      } catch (error) {
        console.error('Failed to fetch transitions:', error);
      } finally {
        setLoadingTransitions(false);
      }
    };

    fetchTransitions();
  }, [editingProjectDetails, projects, jiraEpics, projectsFilter.jiraSpace]);

  // Load field mappings when Admin tab is active
  useEffect(() => {
    if (activeTab === 'admin' && !mappingsLoaded) {
      fetch('/api/admin/mappings')
        .then(response => {
          if (!response.ok) {
            throw new Error(`Failed to load mappings: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          setFieldMappings(Array.isArray(data) ? data : []);
          setMappingsLoaded(true);
        })
        .catch(error => {
          console.error('Failed to load field mappings:', error);
          // Use default mappings on error
          setFieldMappings([]);
        });
    }
  }, [activeTab, mappingsLoaded]);

  const handleEditAllocation = (projectId: string, role: string) => {
    const allocation = DEMO_ALLOCATIONS.find(a => a.projectId === projectId && a.role === role);
    if (allocation) {
      setEditingAllocation({ projectId, role });
      // Calculate expected hours based on date range and hours per week
      const start = new Date(allocation.startDate);
      const end = new Date(allocation.endDate);
      const weeks = Math.ceil((end.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000));
      const expectedHours = weeks * allocation.hoursPerWeek;

      setEditModalData({
        userId: allocation.userId,
        startDate: allocation.startDate,
        endDate: allocation.endDate,
        expectedHours: expectedHours
      });
    }
  };

  // Timeline helper functions
  const getTimelineColumns = () => {
    const startDate = new Date(timelineFilters.dateFrom);
    const endDate = new Date(timelineFilters.dateTo);
    const columns: { label: string; startDate: string; endDate: string }[] = [];

    if (timelineViewMode === 'weekly') {
      let current = new Date(startDate);
      while (current <= endDate) {
        const weekEnd = new Date(current);
        weekEnd.setDate(weekEnd.getDate() + 6);
        const endOfWeek = weekEnd > endDate ? endDate : weekEnd;
        columns.push({
          label: `${current.getMonth() + 1}/${current.getDate()}`,
          startDate: current.toISOString().split('T')[0],
          endDate: endOfWeek.toISOString().split('T')[0]
        });
        current.setDate(current.getDate() + 7);
      }
    } else if (timelineViewMode === 'monthly') {
      let current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
      while (current <= endDate) {
        const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0);
        const endOfMonth = monthEnd > endDate ? endDate : monthEnd;
        columns.push({
          label: current.toLocaleString('default', { month: 'short', year: '2-digit' }),
          startDate: current.toISOString().split('T')[0],
          endDate: endOfMonth.toISOString().split('T')[0]
        });
        current.setMonth(current.getMonth() + 1);
      }
    } else if (timelineViewMode === 'quarterly') {
      let current = new Date(startDate.getFullYear(), Math.floor(startDate.getMonth() / 3) * 3, 1);
      while (current <= endDate) {
        const quarterEnd = new Date(current.getFullYear(), current.getMonth() + 3, 0);
        const endOfQuarter = quarterEnd > endDate ? endDate : quarterEnd;
        const quarter = Math.floor(current.getMonth() / 3) + 1;
        columns.push({
          label: `Q${quarter} ${current.getFullYear()}`,
          startDate: current.toISOString().split('T')[0],
          endDate: endOfQuarter.toISOString().split('T')[0]
        });
        current.setMonth(current.getMonth() + 3);
      }
    } else if (timelineViewMode === 'yearly') {
      let current = new Date(startDate.getFullYear(), 0, 1);
      while (current <= endDate) {
        const yearEnd = new Date(current.getFullYear(), 11, 31);
        const endOfYear = yearEnd > endDate ? endDate : yearEnd;
        columns.push({
          label: `${current.getFullYear()}`,
          startDate: current.toISOString().split('T')[0],
          endDate: endOfYear.toISOString().split('T')[0]
        });
        current.setFullYear(current.getFullYear() + 1);
      }
    }

    return columns;
  };

  const getProjectPosition = (projectStartDate: string, projectEndDate: string, columns: ReturnType<typeof getTimelineColumns>) => {
    let startCol = -1;
    let endCol = -1;

    columns.forEach((col, idx) => {
      if (startCol === -1 && projectStartDate <= col.endDate && projectEndDate >= col.startDate) {
        startCol = idx;
      }
      if (projectStartDate <= col.endDate && projectEndDate >= col.startDate) {
        endCol = idx;
      }
    });

    if (startCol === -1 || endCol === -1) return null;
    return { startCol: startCol + 1, span: endCol - startCol + 1 };
  };

  const timelineColumns = getTimelineColumns();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Cap Planner</h1>
              <p className="text-sm text-gray-500 mt-1">Enterprise Capacity Planning Demo</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{currentUser.name || 'Loading...'}</p>
                <p className="text-xs text-gray-500">{currentUser.roles.includes('Admin') ? 'Admin' : 'User'}</p>
              </div>
              <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                {currentUser.name
                  ? currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                  : '??'}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {['projects', 'assignments', 'members', 'roles', 'timeline', 'actuals', ...(currentUser.roles.includes('Admin') ? ['admin'] : [])].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Projects Tab */}
        {activeTab === 'projects' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-gray-900">Projects</h2>
                <div className="relative group">
                  <div className="inline-flex items-center justify-center w-5 h-5 bg-blue-100 text-blue-600 border border-blue-600 rounded-full text-xs font-bold cursor-help">
                    i
                  </div>
                  <div className="absolute left-1/2 transform -translate-x-1/2 top-7 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 w-72 text-sm text-gray-700 leading-relaxed">
                      Hey there! Just a friendly heads up – the source of truth for all projects lives in the <strong>sntech</strong> instance of Jira.
                      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-gray-200"></div>
                    </div>
                  </div>
                </div>
              </div>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                + New Project
              </button>
            </div>

            {/* Informative Note */}
            {showInfoBox && (
              <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 mb-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm text-blue-800">
                      <span className="font-semibold">Good to know:</span> When you filter to a Jira project, both epics and initiatives are displayed by default.
                      For Technology projects in ITPM, <strong>Initiatives are the top-level work items</strong> (not epics).
                      Use the "Initiative Level Only" checkbox to focus on strategic, top-level initiatives.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowInfoBox(false)}
                    className="ml-3 flex-shrink-0 text-blue-600 hover:text-blue-800 focus:outline-none"
                    aria-label="Close info box"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Loading State */}
            {loadingProjects && (
              <div className="bg-white rounded-lg shadow p-8 mb-4 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">Loading projects from Jira...</p>
              </div>
            )}

            {/* Error State */}
            {projectsError && !loadingProjects && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex items-center">
                  <span className="text-red-600 font-semibold mr-2">⚠</span>
                  <p className="text-red-800">{projectsError}</p>
                </div>
                <p className="text-sm text-red-600 mt-2">
                  Please ensure you have configured Jira credentials in the Admin tab.
                </p>
              </div>
            )}

            {/* Loading Epics State */}
            {loadingEpics && (projectsFilter.jiraSpace.length > 0 || projectsFilter.initiativeOnly) && (
              <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 mb-4">
                <div className="flex items-center">
                  <div className="flex items-center mr-3 h-6">
                    <style dangerouslySetInnerHTML={{__html: `
                      @keyframes pop {
                        0%, 100% { transform: translateY(0) scale(1); opacity: 0.4; }
                        25% { transform: translateY(-8px) scale(1.2); opacity: 1; }
                        50% { transform: translateY(-12px) scale(1.3); opacity: 1; }
                        75% { transform: translateY(-6px) scale(1.1); opacity: 0.8; }
                      }
                      .popcorn-1 { animation: pop 0.8s ease-in-out infinite; animation-delay: 0s; }
                      .popcorn-2 { animation: pop 0.8s ease-in-out infinite; animation-delay: 0.2s; }
                      .popcorn-3 { animation: pop 0.8s ease-in-out infinite; animation-delay: 0.4s; }
                    `}} />
                    <span className="popcorn-1 text-xl">🍿</span>
                    <span className="popcorn-2 text-xl -ml-2">🍿</span>
                    <span className="popcorn-3 text-xl -ml-2">🍿</span>
                  </div>
                  <p className="text-gray-800">
                    Loading {projectsFilter.initiativeOnly ? 'initiatives' : 'epics and initiatives'} from Jira...
                  </p>
                </div>
              </div>
            )}

            {/* Epics Error State */}
            {epicsError && !loadingEpics && (projectsFilter.jiraSpace.length > 0 || projectsFilter.initiativeOnly) && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex items-center">
                  <span className="text-red-600 font-semibold mr-2">⚠</span>
                  <p className="text-red-800">{epicsError}</p>
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-4 mb-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <h3 className="text-sm font-semibold text-gray-700">Filters</h3>
                  {/* Excel Mode Toggle */}
                  <label className="flex items-center cursor-pointer">
                    <span className="text-xs text-gray-500 mr-2">Excel Mode</span>
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={excelFilterMode}
                        onChange={(e) => setExcelFilterMode(e.target.checked)}
                        className="sr-only"
                      />
                      <div className={`w-10 h-5 rounded-full shadow-inner transition-colors ${excelFilterMode ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <div className={`absolute w-4 h-4 bg-white rounded-full shadow top-0.5 transition-transform ${excelFilterMode ? 'translate-x-5' : 'translate-x-0.5'}`}></div>
                    </div>
                  </label>
                </div>
                <button
                  onClick={() => setProjectsFiltersCollapsed(!projectsFiltersCollapsed)}
                  className="text-gray-500 hover:text-gray-700 text-sm font-medium flex items-center"
                >
                  {projectsFiltersCollapsed ? (
                    <>
                      <span className="mr-1">Show</span>
                      <span>▼</span>
                    </>
                  ) : (
                    <>
                      <span className="mr-1">Hide</span>
                      <span>▲</span>
                    </>
                  )}
                </button>
              </div>

              {!projectsFiltersCollapsed && (
                <>
                  {/* Search Box */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                    <input
                      type="text"
                      value={projectsSearch}
                      onChange={(e) => setProjectsSearch(e.target.value)}
                      placeholder="Search projects by name, description, owner, workstream, PAR..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <div className="relative dropdown-container">
                    <button
                      data-dropdown
                      onClick={() => toggleDropdown('projects-role')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-left bg-white hover:bg-gray-50 flex justify-between items-center"
                    >
                      <span className="truncate">
                        {projectsFilter.role.length === 0 ? 'All Roles' : `${projectsFilter.role.length} selected`}
                      </span>
                      <span className="ml-2">▼</span>
                    </button>
                    {openDropdowns['projects-role'] && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg" style={{ minWidth: '280px' }}>
                        {/* Excel-style controls */}
                        {excelFilterMode && (
                          <div className="p-2 border-b border-gray-200 bg-gray-50">
                            <input
                              type="text"
                              placeholder="Search..."
                              value={dropdownSearches['projects-role'] || ''}
                              onChange={(e) => updateDropdownSearch('projects-role', e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded mb-2"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div className="flex justify-between items-center">
                              <div className="flex gap-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const filtered = getFilteredAndSortedOptions('projects-role', uniqueRoles);
                                    setProjectsFilter({...projectsFilter, role: [...new Set([...projectsFilter.role, ...filtered])]});
                                  }}
                                  className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded"
                                >
                                  Select All
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setProjectsFilter({...projectsFilter, role: []});
                                  }}
                                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded"
                                >
                                  Clear
                                </button>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleDropdownSort('projects-role');
                                }}
                                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded flex items-center gap-1"
                              >
                                {dropdownSortOrders['projects-role'] === 'desc' ? 'Z-A' : 'A-Z'}
                                <span>{dropdownSortOrders['projects-role'] === 'desc' ? '↓' : '↑'}</span>
                              </button>
                            </div>
                          </div>
                        )}
                        <div className="max-h-48 overflow-auto">
                          {getFilteredAndSortedOptions('projects-role', uniqueRoles).map(role => (
                            <label key={role} className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={projectsFilter.role.includes(role)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setProjectsFilter({...projectsFilter, role: [...projectsFilter.role, role]});
                                  } else {
                                    setProjectsFilter({...projectsFilter, role: projectsFilter.role.filter(r => r !== role)});
                                  }
                                }}
                                className="rounded mr-2"
                              />
                              <span className="text-sm">{role}</span>
                            </label>
                          ))}
                          {getFilteredAndSortedOptions('projects-role', uniqueRoles).length === 0 && (
                            <div className="px-3 py-2 text-sm text-gray-500 italic">No matches found</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <div className="relative dropdown-container">
                    <button
                      data-dropdown
                      onClick={() => toggleDropdown('projects-priority')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-left bg-white hover:bg-gray-50 flex justify-between items-center"
                    >
                      <span className="truncate">
                        {projectsFilter.priority.length === 0 ? 'All Priorities' : `${projectsFilter.priority.length} selected`}
                      </span>
                      <span className="ml-2">▼</span>
                    </button>
                    {openDropdowns['projects-priority'] && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg" style={{ minWidth: '280px' }}>
                        {excelFilterMode && (
                          <div className="p-2 border-b border-gray-200 bg-gray-50">
                            <input
                              type="text"
                              placeholder="Search..."
                              value={dropdownSearches['projects-priority'] || ''}
                              onChange={(e) => updateDropdownSearch('projects-priority', e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded mb-2"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div className="flex justify-between items-center">
                              <div className="flex gap-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const filtered = getFilteredAndSortedOptions('projects-priority', uniquePriorities);
                                    setProjectsFilter({...projectsFilter, priority: [...new Set([...projectsFilter.priority, ...filtered])]});
                                  }}
                                  className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded"
                                >
                                  Select All
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setProjectsFilter({...projectsFilter, priority: []});
                                  }}
                                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded"
                                >
                                  Clear
                                </button>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleDropdownSort('projects-priority');
                                }}
                                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded flex items-center gap-1"
                              >
                                {dropdownSortOrders['projects-priority'] === 'desc' ? 'Z-A' : 'A-Z'}
                                <span>{dropdownSortOrders['projects-priority'] === 'desc' ? '↓' : '↑'}</span>
                              </button>
                            </div>
                          </div>
                        )}
                        <div className="max-h-48 overflow-auto">
                          {getFilteredAndSortedOptions('projects-priority', uniquePriorities).map(p => (
                            <label key={p} className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={projectsFilter.priority.includes(p)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setProjectsFilter({...projectsFilter, priority: [...projectsFilter.priority, p]});
                                  } else {
                                    setProjectsFilter({...projectsFilter, priority: projectsFilter.priority.filter(pr => pr !== p)});
                                  }
                                }}
                                className="rounded mr-2"
                              />
                              <span className="text-sm">{p}</span>
                            </label>
                          ))}
                          {getFilteredAndSortedOptions('projects-priority', uniquePriorities).length === 0 && (
                            <div className="px-3 py-2 text-sm text-gray-500 italic">No matches found</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <div className="relative dropdown-container">
                    <button
                      data-dropdown
                      onClick={() => toggleDropdown('projects-status')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-left bg-white hover:bg-gray-50 flex justify-between items-center"
                    >
                      <span className="truncate">
                        {projectsFilter.status.length === 0 ? 'All Statuses' : `${projectsFilter.status.length} selected`}
                      </span>
                      <span className="ml-2">▼</span>
                    </button>
                    {openDropdowns['projects-status'] && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg" style={{ minWidth: '280px' }}>
                        {excelFilterMode && (
                          <div className="p-2 border-b border-gray-200 bg-gray-50">
                            <input
                              type="text"
                              placeholder="Search..."
                              value={dropdownSearches['projects-status'] || ''}
                              onChange={(e) => updateDropdownSearch('projects-status', e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded mb-2"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div className="flex justify-between items-center">
                              <div className="flex gap-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const filtered = getFilteredAndSortedOptions('projects-status', uniqueStatuses, (s) => statusDisplayNames[s] || s);
                                    setProjectsFilter({...projectsFilter, status: [...new Set([...projectsFilter.status, ...filtered])]});
                                  }}
                                  className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded"
                                >
                                  Select All
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setProjectsFilter({...projectsFilter, status: []});
                                  }}
                                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded"
                                >
                                  Clear
                                </button>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleDropdownSort('projects-status');
                                }}
                                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded flex items-center gap-1"
                              >
                                {dropdownSortOrders['projects-status'] === 'desc' ? 'Z-A' : 'A-Z'}
                                <span>{dropdownSortOrders['projects-status'] === 'desc' ? '↓' : '↑'}</span>
                              </button>
                            </div>
                          </div>
                        )}
                        <div className="max-h-48 overflow-auto">
                          {getFilteredAndSortedOptions('projects-status', uniqueStatuses, (s) => statusDisplayNames[s] || s).map(status => (
                            <label key={status} className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={projectsFilter.status.includes(status)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setProjectsFilter({...projectsFilter, status: [...projectsFilter.status, status]});
                                  } else {
                                    setProjectsFilter({...projectsFilter, status: projectsFilter.status.filter((s: string) => s !== status)});
                                  }
                                }}
                                className="rounded mr-2"
                              />
                              <span className="text-sm">{statusDisplayNames[status] || status}</span>
                            </label>
                          ))}
                          {getFilteredAndSortedOptions('projects-status', uniqueStatuses, (s) => statusDisplayNames[s] || s).length === 0 && (
                            <div className="px-3 py-2 text-sm text-gray-500 italic">No matches found</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jira Project</label>
                  <div className="relative dropdown-container">
                    <button
                      data-dropdown
                      onClick={() => toggleDropdown('projects-jiraspace')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-left bg-white hover:bg-gray-50 flex justify-between items-center"
                    >
                      <span className="truncate">
                        {projectsFilter.jiraSpace.length === 0 ? 'All Projects' : `${projectsFilter.jiraSpace.length} selected`}
                      </span>
                      <span className="ml-2">▼</span>
                    </button>
                    {openDropdowns['projects-jiraspace'] && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg" style={{ minWidth: '280px' }}>
                        {excelFilterMode && (
                          <div className="p-2 border-b border-gray-200 bg-gray-50">
                            <input
                              type="text"
                              placeholder="Search..."
                              value={dropdownSearches['projects-jiraspace'] || ''}
                              onChange={(e) => updateDropdownSearch('projects-jiraspace', e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded mb-2"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div className="flex justify-between items-center">
                              <div className="flex gap-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const filtered = getFilteredAndSortedOptions('projects-jiraspace', uniqueJiraProjects, (p) => p.name);
                                    setProjectsFilter({...projectsFilter, jiraSpace: [...new Set([...projectsFilter.jiraSpace, ...filtered.map(p => p.id)])]});
                                  }}
                                  className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded"
                                >
                                  Select All
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setProjectsFilter({...projectsFilter, jiraSpace: []});
                                  }}
                                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded"
                                >
                                  Clear
                                </button>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleDropdownSort('projects-jiraspace');
                                }}
                                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded flex items-center gap-1"
                              >
                                {dropdownSortOrders['projects-jiraspace'] === 'desc' ? 'Z-A' : 'A-Z'}
                                <span>{dropdownSortOrders['projects-jiraspace'] === 'desc' ? '↓' : '↑'}</span>
                              </button>
                            </div>
                          </div>
                        )}
                        <div className="max-h-48 overflow-auto">
                          {getFilteredAndSortedOptions('projects-jiraspace', uniqueJiraProjects, (p) => p.name).map(project => (
                            <label key={project.id} className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={projectsFilter.jiraSpace.includes(project.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setProjectsFilter({...projectsFilter, jiraSpace: [...projectsFilter.jiraSpace, project.id]});
                                  } else {
                                    setProjectsFilter({...projectsFilter, jiraSpace: projectsFilter.jiraSpace.filter(id => id !== project.id)});
                                  }
                                }}
                                className="rounded mr-2"
                              />
                              <span className="text-sm">{project.name}</span>
                            </label>
                          ))}
                          {getFilteredAndSortedOptions('projects-jiraspace', uniqueJiraProjects, (p) => p.name).length === 0 && (
                            <div className="px-3 py-2 text-sm text-gray-500 italic">No matches found</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="mt-2">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={projectsFilter.initiativeOnly}
                        onChange={(e) => setProjectsFilter({...projectsFilter, initiativeOnly: e.target.checked})}
                        className="rounded mr-2"
                      />
                      <span className="text-sm text-gray-700">Initiative Level Only</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Skill</label>
                  <div className="relative dropdown-container">
                    <button
                      data-dropdown
                      onClick={() => toggleDropdown('projects-skill')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-left bg-white hover:bg-gray-50 flex justify-between items-center"
                    >
                      <span className="truncate">
                        {projectsFilter.skill.length === 0 ? 'All Skills' : `${projectsFilter.skill.length} selected`}
                      </span>
                      <span className="ml-2">▼</span>
                    </button>
                    {openDropdowns['projects-skill'] && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg" style={{ minWidth: '280px' }}>
                        {excelFilterMode && (
                          <div className="p-2 border-b border-gray-200 bg-gray-50">
                            <input
                              type="text"
                              placeholder="Search..."
                              value={dropdownSearches['projects-skill'] || ''}
                              onChange={(e) => updateDropdownSearch('projects-skill', e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded mb-2"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div className="flex justify-between items-center">
                              <div className="flex gap-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const filtered = getFilteredAndSortedOptions('projects-skill', uniqueSkills);
                                    setProjectsFilter({...projectsFilter, skill: [...new Set([...projectsFilter.skill, ...filtered])]});
                                  }}
                                  className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded"
                                >
                                  Select All
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setProjectsFilter({...projectsFilter, skill: []});
                                  }}
                                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded"
                                >
                                  Clear
                                </button>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleDropdownSort('projects-skill');
                                }}
                                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded flex items-center gap-1"
                              >
                                {dropdownSortOrders['projects-skill'] === 'desc' ? 'Z-A' : 'A-Z'}
                                <span>{dropdownSortOrders['projects-skill'] === 'desc' ? '↓' : '↑'}</span>
                              </button>
                            </div>
                          </div>
                        )}
                        <div className="max-h-48 overflow-auto">
                          {getFilteredAndSortedOptions('projects-skill', uniqueSkills).map(skill => (
                            <label key={skill} className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={projectsFilter.skill.includes(skill)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setProjectsFilter({...projectsFilter, skill: [...projectsFilter.skill, skill]});
                                  } else {
                                    setProjectsFilter({...projectsFilter, skill: projectsFilter.skill.filter((s: string) => s !== skill)});
                                  }
                                }}
                                className="rounded mr-2"
                              />
                              <span className="text-sm">{skill}</span>
                            </label>
                          ))}
                          {getFilteredAndSortedOptions('projects-skill', uniqueSkills).length === 0 && (
                            <div className="px-3 py-2 text-sm text-gray-500 italic">No matches found</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Owner</label>
                  <div className="relative dropdown-container">
                    <button
                      data-dropdown
                      onClick={() => toggleDropdown('projects-owner')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-left bg-white hover:bg-gray-50 flex justify-between items-center"
                    >
                      <span className="truncate">
                        {projectsFilter.owner.length === 0 ? 'All Owners' : `${projectsFilter.owner.length} selected`}
                      </span>
                      <span className="ml-2">▼</span>
                    </button>
                    {openDropdowns['projects-owner'] && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg" style={{ minWidth: '280px' }}>
                        {excelFilterMode && (
                          <div className="p-2 border-b border-gray-200 bg-gray-50">
                            <input
                              type="text"
                              placeholder="Search..."
                              value={dropdownSearches['projects-owner'] || ''}
                              onChange={(e) => updateDropdownSearch('projects-owner', e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded mb-2"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div className="flex justify-between items-center">
                              <div className="flex gap-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const filtered = getFilteredAndSortedOptions('projects-owner', uniqueOwners);
                                    setProjectsFilter({...projectsFilter, owner: [...new Set([...projectsFilter.owner, ...filtered])]});
                                  }}
                                  className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded"
                                >
                                  Select All
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setProjectsFilter({...projectsFilter, owner: []});
                                  }}
                                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded"
                                >
                                  Clear
                                </button>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleDropdownSort('projects-owner');
                                }}
                                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded flex items-center gap-1"
                              >
                                {dropdownSortOrders['projects-owner'] === 'desc' ? 'Z-A' : 'A-Z'}
                                <span>{dropdownSortOrders['projects-owner'] === 'desc' ? '↓' : '↑'}</span>
                              </button>
                            </div>
                          </div>
                        )}
                        <div className="max-h-48 overflow-auto">
                          {getFilteredAndSortedOptions('projects-owner', uniqueOwners).map(owner => (
                            <label key={owner} className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={projectsFilter.owner.includes(owner)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setProjectsFilter({...projectsFilter, owner: [...projectsFilter.owner, owner]});
                                  } else {
                                    setProjectsFilter({...projectsFilter, owner: projectsFilter.owner.filter(o => o !== owner)});
                                  }
                                }}
                                className="rounded mr-2"
                              />
                              <span className="text-sm">{owner}</span>
                            </label>
                          ))}
                          {getFilteredAndSortedOptions('projects-owner', uniqueOwners).length === 0 && (
                            <div className="px-3 py-2 text-sm text-gray-500 italic">No matches found</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Workstream</label>
                  <div className="relative dropdown-container">
                    <button
                      data-dropdown
                      onClick={() => toggleDropdown('projects-workstream')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-left bg-white hover:bg-gray-50 flex justify-between items-center"
                    >
                      <span className="truncate">
                        {projectsFilter.workstream.length === 0 ? 'All Workstreams' : `${projectsFilter.workstream.length} selected`}
                      </span>
                      <span className="ml-2">▼</span>
                    </button>
                    {openDropdowns['projects-workstream'] && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg" style={{ minWidth: '280px' }}>
                        {excelFilterMode && (
                          <div className="p-2 border-b border-gray-200 bg-gray-50">
                            <input
                              type="text"
                              placeholder="Search..."
                              value={dropdownSearches['projects-workstream'] || ''}
                              onChange={(e) => updateDropdownSearch('projects-workstream', e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded mb-2"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div className="flex justify-between items-center">
                              <div className="flex gap-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const filtered = getFilteredAndSortedOptions('projects-workstream', uniqueWorkstreams);
                                    setProjectsFilter({...projectsFilter, workstream: [...new Set([...projectsFilter.workstream, ...filtered])]});
                                  }}
                                  className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded"
                                >
                                  Select All
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setProjectsFilter({...projectsFilter, workstream: []});
                                  }}
                                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded"
                                >
                                  Clear
                                </button>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleDropdownSort('projects-workstream');
                                }}
                                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded flex items-center gap-1"
                              >
                                {dropdownSortOrders['projects-workstream'] === 'desc' ? 'Z-A' : 'A-Z'}
                                <span>{dropdownSortOrders['projects-workstream'] === 'desc' ? '↓' : '↑'}</span>
                              </button>
                            </div>
                          </div>
                        )}
                        <div className="max-h-48 overflow-auto">
                          {getFilteredAndSortedOptions('projects-workstream', uniqueWorkstreams).map(ws => (
                            <label key={ws} className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={projectsFilter.workstream.includes(ws)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setProjectsFilter({...projectsFilter, workstream: [...projectsFilter.workstream, ws]});
                                  } else {
                                    setProjectsFilter({...projectsFilter, workstream: projectsFilter.workstream.filter(w => w !== ws)});
                                  }
                                }}
                                className="rounded mr-2"
                              />
                              <span className="text-sm">{ws}</span>
                            </label>
                          ))}
                          {getFilteredAndSortedOptions('projects-workstream', uniqueWorkstreams).length === 0 && (
                            <div className="px-3 py-2 text-sm text-gray-500 italic">No matches found</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
                  <input
                    type="date"
                    value={projectsFilter.dateFrom}
                    onChange={(e) => setProjectsFilter({...projectsFilter, dateFrom: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
                  <input
                    type="date"
                    value={projectsFilter.dateTo}
                    onChange={(e) => setProjectsFilter({...projectsFilter, dateTo: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
                <div className="flex flex-col justify-end gap-2">
                  <label className="flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={projectsFilter.noRoles}
                      onChange={(e) => setProjectsFilter({...projectsFilter, noRoles: e.target.checked})}
                      className="rounded"
                    />
                    No Roles Defined
                  </label>
                  <label className="flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={projectsFilter.missingAssignees}
                      onChange={(e) => setProjectsFilter({...projectsFilter, missingAssignees: e.target.checked})}
                      className="rounded"
                    />
                    Missing Assignees
                  </label>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setProjectsFilter({noRoles: false, missingAssignees: false, role: [], priority: [], status: [], dateFrom: '', dateTo: '', skill: [], owner: [], workstream: [], jiraSpace: [], initiativeOnly: false});
                      setProjectsSearch('');
                    }}
                    className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
                </>
              )}
            </div>

            <div className="flex justify-end mb-4">
              <div className="text-sm text-gray-600">
                Showing <span className="font-semibold text-gray-900">{filteredProjects.length}</span> project{filteredProjects.length !== 1 ? 's' : ''}
              </div>
            </div>

            <div className="grid gap-4">
              {filteredProjects.map((project) => {
                const projectAllocations = DEMO_ALLOCATIONS.filter(a => a.projectId === project.id);
                const filledRoles = projectAllocations.map(a => a.role);
                const missingRoles = project.requiredRoles.filter((r: string) => !filledRoles.includes(r));
                const hasIssues = missingRoles.length > 0 || (project.requiredRoles.length > 0 && projectAllocations.length === 0);

                // Simplified card when no Jira projects are selected AND initiativeOnly is not checked
                if (projectsFilter.jiraSpace.length === 0 && !projectsFilter.initiativeOnly) {
                  return (
                    <div key={project.id} className="bg-white rounded-lg shadow p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">{getProjectDisplayName(project.name, true)}</h3>
                          {project.description && (
                            <p className="text-sm text-gray-600 mt-2 italic">{project.description}</p>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            setProjectsFilter({...projectsFilter, jiraSpace: [project.id]});
                          }}
                          className="ml-4 px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 whitespace-nowrap"
                        >
                          Filter to Project
                        </button>
                      </div>
                    </div>
                  );
                }

                // Full card for Jira epics/initiatives
                return (
                  <div key={project.id} className={`bg-white rounded-lg shadow p-6 ${hasIssues ? 'border-l-4 border-red-500' : ''}`}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-gray-900">{getProjectDisplayName(project.name)}</h3>
                          {hasIssues && (
                            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded">⚠️ Missing Roles</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-2 italic">{project.description}</p>
                        <p className="text-sm text-gray-500 mt-2">
                          <span className="font-medium">Owner:</span> {project.owner} | <span className="font-medium">Workstream:</span> {project.workstream}
                          {project.jiraKey && (
                            <>
                              {' | '}
                              <a
                                href={`https://sntech.atlassian.net/browse/${project.jiraKey}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-700 underline font-medium"
                              >
                                {project.jiraKey}
                              </a>
                            </>
                          )}
                        </p>
                        {(project as any).businessOwner && (
                          <p className="text-sm text-gray-500 mt-1">
                            <span className="font-medium">Business Owner:</span> {(project as any).businessOwner}
                          </p>
                        )}
                        <p className="text-sm text-gray-500 mt-1">
                          <span className="font-medium">PAR:</span> {(project as any).par || 'N/A'}
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                          <span className="font-medium">Dates:</span> {project.startDate} → {project.endDate}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          <span className="font-medium">In-Service Date:</span> {project.inServiceDate}
                        </p>
                        {(project as any).capitalExpense && (
                          <p className="text-sm text-gray-500 mt-1">
                            <span className="font-medium">Capital/Expense:</span> {(project as any).capitalExpense}
                          </p>
                        )}
                        {(project as any).businessValue && (
                          <p className="text-sm text-gray-500 mt-1">
                            <span className="font-medium">Business Value:</span> {(project as any).businessValue}
                          </p>
                        )}
                        <button
                          onClick={() => {
                            setEditingProjectDetails(project.id);
                            setProjectDetailsData({
                              description: project.description || '',
                              owner: project.owner || '',
                              businessOwner: (project as any).businessOwner || '',
                              workstream: project.workstream || '',
                              par: (project as any).par || '',
                              startDate: project.startDate || '',
                              endDate: project.endDate || '',
                              inserviceDate: project.inServiceDate || '',
                              businessValue: (project as any).businessValue || '',
                              capitalExpense: (project as any).capitalExpense || '',
                              healthStatus: (project as any).healthStatus || ''
                            });
                          }}
                          className="text-xs text-blue-600 hover:text-blue-700 underline mt-2"
                        >
                          Edit Details
                        </button>
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[project.status] || 'bg-gray-200 text-gray-800'}`}>
                          {statusDisplayNames[project.status] || project.status}
                        </span>
                        {(project as any).healthStatus && (
                          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border shadow-sm"
                            style={{
                              backgroundColor: (project as any).healthStatus === 'Green' ? '#dcfce7' :
                                               (project as any).healthStatus === 'Yellow' ? '#fef3c7' :
                                               (project as any).healthStatus === 'Red' ? '#fee2e2' : '#f3f4f6',
                              borderColor: (project as any).healthStatus === 'Green' ? '#86efac' :
                                          (project as any).healthStatus === 'Yellow' ? '#fde047' :
                                          (project as any).healthStatus === 'Red' ? '#fca5a5' : '#e5e7eb',
                              color: (project as any).healthStatus === 'Green' ? '#166534' :
                                     (project as any).healthStatus === 'Yellow' ? '#854d0e' :
                                     (project as any).healthStatus === 'Red' ? '#991b1b' : '#374151'
                            }}
                          >
                            <div className="w-2 h-2 rounded-full"
                              style={{
                                backgroundColor: (project as any).healthStatus === 'Green' ? '#22c55e' :
                                                (project as any).healthStatus === 'Yellow' ? '#eab308' :
                                                (project as any).healthStatus === 'Red' ? '#ef4444' : '#6b7280'
                              }}
                            />
                            Health: {(project as any).healthStatus}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Required Skills Section */}
                    <div className="mt-4 p-3 bg-gray-50 rounded">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-sm font-medium text-gray-700">Required Skills:</p>
                        <button
                          onClick={() => {
                            setSelectedProjectForSkills(project.id);
                            setShowProjectSkillsModal(true);
                          }}
                          className="px-2 py-1 bg-teal-600 text-white text-xs rounded hover:bg-teal-700"
                        >
                          Manage Skills
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {project.requiredSkills && project.requiredSkills.length > 0 ? (
                          project.requiredSkills.map((skill: string, idx: number) => (
                            <span key={idx} className="px-2 py-1 bg-teal-100 text-teal-700 text-xs rounded">
                              {skill}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-gray-500 italic">No skills defined</span>
                        )}
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-sm font-medium text-gray-700">Required Roles & Assignments:</p>
                        <button
                          onClick={() => {
                            setSelectedProjectForRoles(project.id);
                            setShowRoleModal(true);
                          }}
                          className="px-3 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700"
                        >
                          + Manage Roles
                        </button>
                      </div>
                      {project.requiredRoles.length === 0 ? (
                        <p className="text-sm text-red-600">⚠️ No roles defined for this project</p>
                      ) : (
                        <div className="space-y-2">
                          {project.requiredRoles.map((role: string, idx: number) => {
                            const assigned = projectAllocations.find(a => a.role === role);
                            return (
                              <div key={idx} className={`flex justify-between items-center p-2 rounded ${assigned ? 'bg-green-50' : 'bg-red-50'}`}>
                                <span className="text-sm font-medium">{role}</span>
                                {assigned ? (
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm text-green-700">
                                      ✓ {assigned.userName} ({assigned.percentage}%)
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {assigned.startDate} → {assigned.endDate}
                                    </span>
                                    <button
                                      onClick={() => handleEditAllocation(project.id, role)}
                                      className="text-xs text-blue-600 hover:text-blue-700 underline"
                                    >
                                      Edit
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-sm text-red-700">❌ Not Assigned</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Assignments Tab (formerly Allocations) */}
        {activeTab === 'assignments' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Resource Assignments</h2>
              <div className="flex gap-2">
                <div className="relative dropdown-container">
                  <button
                    onClick={() => setShowColumnMenu(!showColumnMenu)}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center gap-2"
                  >
                    <span>⚙</span> Columns
                  </button>
                  {showColumnMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 p-3 z-10">
                      <p className="text-xs font-semibold text-gray-700 mb-2">Toggle Columns</p>
                      <div className="space-y-2">
                        {[
                          { key: 'member', label: 'Member' },
                          { key: 'tempoTeam', label: 'Tempo Team' },
                          { key: 'capacity', label: 'Capacity %' },
                          { key: 'project', label: 'Project' },
                          { key: 'role', label: 'Role' },
                          { key: 'account', label: 'Account' },
                          { key: 'period', label: 'Period' },
                          { key: 'allocation', label: 'Allocation' }
                        ].map(col => (
                          <label key={col.key} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 p-1 rounded">
                            <input
                              type="checkbox"
                              checked={visibleColumns[col.key as keyof typeof visibleColumns]}
                              onChange={(e) => setVisibleColumns({
                                ...visibleColumns,
                                [col.key]: e.target.checked
                              })}
                              className="rounded"
                            />
                            {col.label}
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                  + New Assignment
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-4 mb-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tempo Team</label>
                  <div className="relative dropdown-container">
                    <button
                      data-dropdown
                      onClick={() => toggleDropdown('assignments-tempoTeam')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-left bg-white hover:bg-gray-50 flex justify-between items-center"
                    >
                      <span className="truncate">
                        {assignmentsFilters.tempoTeam.length === 0 ? 'All Teams' : `${assignmentsFilters.tempoTeam.length} selected`}
                      </span>
                      <span className="ml-2">▼</span>
                    </button>
                    {openDropdowns['assignments-tempoTeam'] && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg" style={{ minWidth: '280px' }}>
                        {excelFilterMode && (
                          <div className="p-2 border-b border-gray-200 bg-gray-50">
                            <input
                              type="text"
                              placeholder="Search..."
                              value={dropdownSearches['assignments-tempoTeam'] || ''}
                              onChange={(e) => updateDropdownSearch('assignments-tempoTeam', e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded mb-2"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div className="flex justify-between items-center">
                              <div className="flex gap-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const filtered = getFilteredAndSortedOptions('assignments-tempoTeam', uniqueTempoTeams);
                                    setAssignmentsFilters({...assignmentsFilters, tempoTeam: [...new Set([...assignmentsFilters.tempoTeam, ...filtered])]});
                                  }}
                                  className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded"
                                >
                                  Select All
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setAssignmentsFilters({...assignmentsFilters, tempoTeam: []});
                                  }}
                                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded"
                                >
                                  Clear
                                </button>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleDropdownSort('assignments-tempoTeam');
                                }}
                                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded flex items-center gap-1"
                              >
                                {dropdownSortOrders['assignments-tempoTeam'] === 'desc' ? 'Z-A' : 'A-Z'}
                                <span>{dropdownSortOrders['assignments-tempoTeam'] === 'desc' ? '↓' : '↑'}</span>
                              </button>
                            </div>
                          </div>
                        )}
                        <div className="max-h-48 overflow-auto">
                          {getFilteredAndSortedOptions('assignments-tempoTeam', uniqueTempoTeams).map(team => (
                            <label key={team} className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={assignmentsFilters.tempoTeam.includes(team)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setAssignmentsFilters({...assignmentsFilters, tempoTeam: [...assignmentsFilters.tempoTeam, team]});
                                  } else {
                                    setAssignmentsFilters({...assignmentsFilters, tempoTeam: assignmentsFilters.tempoTeam.filter(t => t !== team)});
                                  }
                                }}
                                className="rounded mr-2"
                              />
                              <span className="text-sm">{team}</span>
                            </label>
                          ))}
                          {getFilteredAndSortedOptions('assignments-tempoTeam', uniqueTempoTeams).length === 0 && (
                            <div className="px-3 py-2 text-sm text-gray-500 italic">No matches found</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <div className="relative dropdown-container">
                    <button
                      data-dropdown
                      onClick={() => toggleDropdown('assignments-role')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-left bg-white hover:bg-gray-50 flex justify-between items-center"
                    >
                      <span className="truncate">
                        {assignmentsFilters.role.length === 0 ? 'All Roles' : `${assignmentsFilters.role.length} selected`}
                      </span>
                      <span className="ml-2">▼</span>
                    </button>
                    {openDropdowns['assignments-role'] && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg" style={{ minWidth: '280px' }}>
                        {excelFilterMode && (
                          <div className="p-2 border-b border-gray-200 bg-gray-50">
                            <input
                              type="text"
                              placeholder="Search..."
                              value={dropdownSearches['assignments-role'] || ''}
                              onChange={(e) => updateDropdownSearch('assignments-role', e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded mb-2"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div className="flex justify-between items-center">
                              <div className="flex gap-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const filtered = getFilteredAndSortedOptions('assignments-role', uniqueRoles);
                                    setAssignmentsFilters({...assignmentsFilters, role: [...new Set([...assignmentsFilters.role, ...filtered])]});
                                  }}
                                  className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded"
                                >
                                  Select All
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setAssignmentsFilters({...assignmentsFilters, role: []});
                                  }}
                                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded"
                                >
                                  Clear
                                </button>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleDropdownSort('assignments-role');
                                }}
                                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded flex items-center gap-1"
                              >
                                {dropdownSortOrders['assignments-role'] === 'desc' ? 'Z-A' : 'A-Z'}
                                <span>{dropdownSortOrders['assignments-role'] === 'desc' ? '↓' : '↑'}</span>
                              </button>
                            </div>
                          </div>
                        )}
                        <div className="max-h-48 overflow-auto">
                          {getFilteredAndSortedOptions('assignments-role', uniqueRoles).map(role => (
                            <label key={role} className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={assignmentsFilters.role.includes(role)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setAssignmentsFilters({...assignmentsFilters, role: [...assignmentsFilters.role, role]});
                                  } else {
                                    setAssignmentsFilters({...assignmentsFilters, role: assignmentsFilters.role.filter(r => r !== role)});
                                  }
                                }}
                                className="rounded mr-2"
                              />
                              <span className="text-sm">{role}</span>
                            </label>
                          ))}
                          {getFilteredAndSortedOptions('assignments-role', uniqueRoles).length === 0 && (
                            <div className="px-3 py-2 text-sm text-gray-500 italic">No matches found</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">User</label>
                  <div className="relative dropdown-container">
                    <button
                      data-dropdown
                      onClick={() => toggleDropdown('assignments-user')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-left bg-white hover:bg-gray-50 flex justify-between items-center"
                    >
                      <span className="truncate">
                        {assignmentsFilters.user.length === 0 ? 'All Users' : `${assignmentsFilters.user.length} selected`}
                      </span>
                      <span className="ml-2">▼</span>
                    </button>
                    {openDropdowns['assignments-user'] && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg" style={{ minWidth: '280px' }}>
                        {excelFilterMode && (
                          <div className="p-2 border-b border-gray-200 bg-gray-50">
                            <input
                              type="text"
                              placeholder="Search..."
                              value={dropdownSearches['assignments-user'] || ''}
                              onChange={(e) => updateDropdownSearch('assignments-user', e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded mb-2"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div className="flex justify-between items-center">
                              <div className="flex gap-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const filtered = getFilteredAndSortedOptions('assignments-user', uniqueUsers);
                                    setAssignmentsFilters({...assignmentsFilters, user: [...new Set([...assignmentsFilters.user, ...filtered])]});
                                  }}
                                  className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded"
                                >
                                  Select All
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setAssignmentsFilters({...assignmentsFilters, user: []});
                                  }}
                                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded"
                                >
                                  Clear
                                </button>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleDropdownSort('assignments-user');
                                }}
                                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded flex items-center gap-1"
                              >
                                {dropdownSortOrders['assignments-user'] === 'desc' ? 'Z-A' : 'A-Z'}
                                <span>{dropdownSortOrders['assignments-user'] === 'desc' ? '↓' : '↑'}</span>
                              </button>
                            </div>
                          </div>
                        )}
                        <div className="max-h-48 overflow-auto">
                          {getFilteredAndSortedOptions('assignments-user', uniqueUsers).map(user => (
                            <label key={user} className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={assignmentsFilters.user.includes(user)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setAssignmentsFilters({...assignmentsFilters, user: [...assignmentsFilters.user, user]});
                                  } else {
                                    setAssignmentsFilters({...assignmentsFilters, user: assignmentsFilters.user.filter(u => u !== user)});
                                  }
                                }}
                                className="rounded mr-2"
                              />
                              <span className="text-sm">{user}</span>
                            </label>
                          ))}
                          {getFilteredAndSortedOptions('assignments-user', uniqueUsers).length === 0 && (
                            <div className="px-3 py-2 text-sm text-gray-500 italic">No matches found</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tempo Account</label>
                  <div className="relative dropdown-container">
                    <button
                      data-dropdown
                      onClick={() => toggleDropdown('assignments-account')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-left bg-white hover:bg-gray-50 flex justify-between items-center"
                    >
                      <span className="truncate">
                        {assignmentsFilters.account.length === 0 ? 'All Accounts' : `${assignmentsFilters.account.length} selected`}
                      </span>
                      <span className="ml-2">▼</span>
                    </button>
                    {openDropdowns['assignments-account'] && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg" style={{ minWidth: '280px' }}>
                        {excelFilterMode && (
                          <div className="p-2 border-b border-gray-200 bg-gray-50">
                            <input
                              type="text"
                              placeholder="Search..."
                              value={dropdownSearches['assignments-account'] || ''}
                              onChange={(e) => updateDropdownSearch('assignments-account', e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded mb-2"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div className="flex justify-between items-center">
                              <div className="flex gap-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const filtered = getFilteredAndSortedOptions('assignments-account', uniqueAccounts);
                                    setAssignmentsFilters({...assignmentsFilters, account: [...new Set([...assignmentsFilters.account, ...filtered])]});
                                  }}
                                  className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded"
                                >
                                  Select All
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setAssignmentsFilters({...assignmentsFilters, account: []});
                                  }}
                                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded"
                                >
                                  Clear
                                </button>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleDropdownSort('assignments-account');
                                }}
                                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded flex items-center gap-1"
                              >
                                {dropdownSortOrders['assignments-account'] === 'desc' ? 'Z-A' : 'A-Z'}
                                <span>{dropdownSortOrders['assignments-account'] === 'desc' ? '↓' : '↑'}</span>
                              </button>
                            </div>
                          </div>
                        )}
                        <div className="max-h-48 overflow-auto">
                          {getFilteredAndSortedOptions('assignments-account', uniqueAccounts).map(acc => (
                            <label key={acc} className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={assignmentsFilters.account.includes(acc)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setAssignmentsFilters({...assignmentsFilters, account: [...assignmentsFilters.account, acc]});
                                  } else {
                                    setAssignmentsFilters({...assignmentsFilters, account: assignmentsFilters.account.filter(a => a !== acc)});
                                  }
                                }}
                                className="rounded mr-2"
                              />
                              <span className="text-sm">{acc}</span>
                            </label>
                          ))}
                          {getFilteredAndSortedOptions('assignments-account', uniqueAccounts).length === 0 && (
                            <div className="px-3 py-2 text-sm text-gray-500 italic">No matches found</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
                  <input
                    type="date"
                    value={assignmentsFilters.dateFrom}
                    onChange={(e) => setAssignmentsFilters({...assignmentsFilters, dateFrom: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
                  <input
                    type="date"
                    value={assignmentsFilters.dateTo}
                    onChange={(e) => setAssignmentsFilters({...assignmentsFilters, dateTo: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Capacity Level</label>
                  <select
                    value={assignmentsFilters.capacityLevel}
                    onChange={(e) => setAssignmentsFilters({...assignmentsFilters, capacityLevel: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="all">All</option>
                    <option value="over">Over 100%</option>
                    <option value="under">Under 100%</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Skill</label>
                  <div className="relative dropdown-container">
                    <button
                      data-dropdown
                      onClick={() => toggleDropdown('assignments-skill')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-left bg-white hover:bg-gray-50 flex justify-between items-center"
                    >
                      <span className="truncate">
                        {assignmentsFilters.skill.length === 0 ? 'All Skills' : `${assignmentsFilters.skill.length} selected`}
                      </span>
                      <span className="ml-2">▼</span>
                    </button>
                    {openDropdowns['assignments-skill'] && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg" style={{ minWidth: '280px' }}>
                        {excelFilterMode && (
                          <div className="p-2 border-b border-gray-200 bg-gray-50">
                            <input
                              type="text"
                              placeholder="Search..."
                              value={dropdownSearches['assignments-skill'] || ''}
                              onChange={(e) => updateDropdownSearch('assignments-skill', e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded mb-2"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div className="flex justify-between items-center">
                              <div className="flex gap-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const filtered = getFilteredAndSortedOptions('assignments-skill', uniqueSkills);
                                    setAssignmentsFilters({...assignmentsFilters, skill: [...new Set([...assignmentsFilters.skill, ...filtered])]});
                                  }}
                                  className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded"
                                >
                                  Select All
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setAssignmentsFilters({...assignmentsFilters, skill: []});
                                  }}
                                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded"
                                >
                                  Clear
                                </button>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleDropdownSort('assignments-skill');
                                }}
                                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded flex items-center gap-1"
                              >
                                {dropdownSortOrders['assignments-skill'] === 'desc' ? 'Z-A' : 'A-Z'}
                                <span>{dropdownSortOrders['assignments-skill'] === 'desc' ? '↓' : '↑'}</span>
                              </button>
                            </div>
                          </div>
                        )}
                        <div className="max-h-48 overflow-auto">
                          {getFilteredAndSortedOptions('assignments-skill', uniqueSkills).map(skill => (
                            <label key={skill} className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={assignmentsFilters.skill.includes(skill)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setAssignmentsFilters({...assignmentsFilters, skill: [...assignmentsFilters.skill, skill]});
                                  } else {
                                    setAssignmentsFilters({...assignmentsFilters, skill: assignmentsFilters.skill.filter((s: string) => s !== skill)});
                                  }
                                }}
                                className="rounded mr-2"
                              />
                              <span className="text-sm">{skill}</span>
                            </label>
                          ))}
                          {getFilteredAndSortedOptions('assignments-skill', uniqueSkills).length === 0 && (
                            <div className="px-3 py-2 text-sm text-gray-500 italic">No matches found</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={assignmentsFilters.showZeroPercent}
                      onChange={(e) => setAssignmentsFilters({...assignmentsFilters, showZeroPercent: e.target.checked})}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700">Show 0% Only</span>
                  </label>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => setAssignmentsFilters({tempoTeam: [], role: [], user: [], account: [], dateFrom: '', dateTo: '', capacityLevel: 'all', skill: [], showZeroPercent: false, jiraSpace: []})}
                    className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-x-auto">
              <table className="w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {visibleColumns.member && (
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                    )}
                    {visibleColumns.tempoTeam && (
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tempo Team</th>
                    )}
                    {visibleColumns.capacity && (
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity %</th>
                    )}
                    {visibleColumns.project && (
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                    )}
                    {visibleColumns.role && (
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    )}
                    {visibleColumns.account && (
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account</th>
                    )}
                    {visibleColumns.period && (
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                    )}
                    {visibleColumns.allocation && (
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Allocation</th>
                    )}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sortedAssignments.map((allocation) => {
                    const capacity = getCurrentCapacity(allocation.userId);
                    return (
                      <tr key={allocation.id} className="hover:bg-gray-50">
                        {visibleColumns.member && (
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-semibold mr-3">
                                {allocation.userName.split(' ').map(n => n[0]).join('')}
                              </div>
                              <div className="text-sm font-medium text-gray-900">{allocation.userName}</div>
                            </div>
                          </td>
                        )}
                        {visibleColumns.tempoTeam && (
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{allocation.tempoTeam}</td>
                        )}
                        {visibleColumns.capacity && (
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${getCapacityDotColor(capacity)}`}></div>
                              <span className="text-sm font-medium text-gray-900">{capacity}%</span>
                            </div>
                          </td>
                        )}
                        {visibleColumns.project && (
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{allocation.projectName}</td>
                        )}
                        {visibleColumns.role && (
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{allocation.role}</td>
                        )}
                        {visibleColumns.account && (
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{allocation.tempoAccount}</td>
                        )}
                        {visibleColumns.period && (
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                            {allocation.startDate} → {allocation.endDate}
                          </td>
                        )}
                        {visibleColumns.allocation && (
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
                                <div
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{ width: `${allocation.percentage}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium text-gray-900">{allocation.percentage}%</span>
                              <span className="text-xs text-gray-500">({allocation.hoursPerWeek}h/wk)</span>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Members Tab */}
        {activeTab === 'members' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Team Members</h2>
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={membersFilter.overCapacity}
                      onChange={(e) => setMembersFilter({...membersFilter, overCapacity: e.target.checked})}
                      className="rounded"
                    />
                    Show only over-capacity members
                  </label>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowSkillsModal(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  + Add Skills
                </button>
                <button
                  onClick={() => setShowNewAllocationModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  + Add Allocation
                </button>
              </div>
            </div>

            {/* Reminder about capacity dates */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-800">
                <span className="font-medium">Note:</span> Capacity is displayed based on the current date set in the date range filter below. Adjust the dates to view capacity levels for different time periods.
              </p>
            </div>

            {/* Date range filter */}
            <div className="bg-white rounded-lg shadow p-4 mb-4">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Search User</label>
                  <input
                    type="text"
                    placeholder="Type to search..."
                    value={membersFilter.user}
                    onChange={(e) => setMembersFilter({...membersFilter, user: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tempo Team</label>
                  <div className="relative dropdown-container">
                    <button
                      data-dropdown
                      onClick={() => toggleDropdown('members-tempoTeam')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-left bg-white hover:bg-gray-50 flex justify-between items-center"
                    >
                      <span className="truncate">
                        {membersFilter.tempoTeam.length === 0 ? 'All Teams' : `${membersFilter.tempoTeam.length} selected`}
                      </span>
                      <span className="ml-2">▼</span>
                    </button>
                    {openDropdowns['members-tempoTeam'] && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg" style={{ minWidth: '280px' }}>
                        {excelFilterMode && (
                          <div className="p-2 border-b border-gray-200 bg-gray-50">
                            <input
                              type="text"
                              placeholder="Search..."
                              value={dropdownSearches['members-tempoTeam'] || ''}
                              onChange={(e) => updateDropdownSearch('members-tempoTeam', e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded mb-2"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div className="flex justify-between items-center">
                              <div className="flex gap-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const filtered = getFilteredAndSortedOptions('members-tempoTeam', uniqueTempoTeams);
                                    setMembersFilter({...membersFilter, tempoTeam: [...new Set([...membersFilter.tempoTeam, ...filtered])]});
                                  }}
                                  className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded"
                                >
                                  Select All
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setMembersFilter({...membersFilter, tempoTeam: []});
                                  }}
                                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded"
                                >
                                  Clear
                                </button>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleDropdownSort('members-tempoTeam');
                                }}
                                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded flex items-center gap-1"
                              >
                                {dropdownSortOrders['members-tempoTeam'] === 'desc' ? 'Z-A' : 'A-Z'}
                                <span>{dropdownSortOrders['members-tempoTeam'] === 'desc' ? '↓' : '↑'}</span>
                              </button>
                            </div>
                          </div>
                        )}
                        <div className="max-h-48 overflow-auto">
                          {getFilteredAndSortedOptions('members-tempoTeam', uniqueTempoTeams).map(team => (
                            <label key={team} className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={membersFilter.tempoTeam.includes(team)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setMembersFilter({...membersFilter, tempoTeam: [...membersFilter.tempoTeam, team]});
                                  } else {
                                    setMembersFilter({...membersFilter, tempoTeam: membersFilter.tempoTeam.filter(t => t !== team)});
                                  }
                                }}
                                className="rounded mr-2"
                              />
                              <span className="text-sm">{team}</span>
                            </label>
                          ))}
                          {getFilteredAndSortedOptions('members-tempoTeam', uniqueTempoTeams).length === 0 && (
                            <div className="px-3 py-2 text-sm text-gray-500 italic">No matches found</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
                  <input
                    type="date"
                    value={membersFilter.dateFrom}
                    onChange={(e) => setMembersFilter({...membersFilter, dateFrom: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
                  <input
                    type="date"
                    value={membersFilter.dateTo}
                    onChange={(e) => setMembersFilter({...membersFilter, dateTo: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Skill</label>
                  <div className="relative dropdown-container">
                    <button
                      data-dropdown
                      onClick={() => toggleDropdown('members-skill')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-left bg-white hover:bg-gray-50 flex justify-between items-center"
                    >
                      <span className="truncate">
                        {membersFilter.skill.length === 0 ? 'All Skills' : `${membersFilter.skill.length} selected`}
                      </span>
                      <span className="ml-2">▼</span>
                    </button>
                    {openDropdowns['members-skill'] && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg" style={{ minWidth: '280px' }}>
                        {excelFilterMode && (
                          <div className="p-2 border-b border-gray-200 bg-gray-50">
                            <input
                              type="text"
                              placeholder="Search..."
                              value={dropdownSearches['members-skill'] || ''}
                              onChange={(e) => updateDropdownSearch('members-skill', e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded mb-2"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div className="flex justify-between items-center">
                              <div className="flex gap-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const filtered = getFilteredAndSortedOptions('members-skill', uniqueSkills);
                                    setMembersFilter({...membersFilter, skill: [...new Set([...membersFilter.skill, ...filtered])]});
                                  }}
                                  className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded"
                                >
                                  Select All
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setMembersFilter({...membersFilter, skill: []});
                                  }}
                                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded"
                                >
                                  Clear
                                </button>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleDropdownSort('members-skill');
                                }}
                                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded flex items-center gap-1"
                              >
                                {dropdownSortOrders['members-skill'] === 'desc' ? 'Z-A' : 'A-Z'}
                                <span>{dropdownSortOrders['members-skill'] === 'desc' ? '↓' : '↑'}</span>
                              </button>
                            </div>
                          </div>
                        )}
                        <div className="max-h-48 overflow-auto">
                          {getFilteredAndSortedOptions('members-skill', uniqueSkills).map(skill => (
                            <label key={skill} className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={membersFilter.skill.includes(skill)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setMembersFilter({...membersFilter, skill: [...membersFilter.skill, skill]});
                                  } else {
                                    setMembersFilter({...membersFilter, skill: membersFilter.skill.filter((s: string) => s !== skill)});
                                  }
                                }}
                                className="rounded mr-2"
                              />
                              <span className="text-sm">{skill}</span>
                            </label>
                          ))}
                          {getFilteredAndSortedOptions('members-skill', uniqueSkills).length === 0 && (
                            <div className="px-3 py-2 text-sm text-gray-500 italic">No matches found</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => setMembersFilter({overCapacity: false, dateFrom: '', dateTo: '', skill: [], user: '', tempoTeam: [], jiraSpace: []})}
                    className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredMembers.map((user) => {
                const totalAllocation = getCurrentCapacity(user.id, membersFilter.dateFrom, membersFilter.dateTo);
                const userAllocations = DEMO_ALLOCATIONS.filter(a => {
                  if (a.userId !== user.id) return false;
                  const currentDate = '2026-01-07';
                  if (membersFilter.dateFrom && a.endDate < membersFilter.dateFrom) return false;
                  if (membersFilter.dateTo && a.startDate > membersFilter.dateTo) return false;
                  return a.startDate <= currentDate && a.endDate >= currentDate;
                });
                const availableCapacity = 100 - totalAllocation;
                const isExpanded = expandedMember === user.id;

                return (
                  <div key={user.id} className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold mr-4">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                          <p className="text-sm text-gray-500">{user.email}</p>
                          <p className="text-xs text-gray-400">{user.tempoTeam}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${roleColors[user.role]}`}>
                        {user.role}
                      </span>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Skills:</p>
                      <div className="flex flex-wrap gap-2">
                        {user.skills.map((skill: string, idx: number) => (
                          <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-gray-700">Capacity (Current: {totalAllocation}% | Available: {availableCapacity}%):</p>
                        <button
                          onClick={() => setExpandedMember(isExpanded ? null : user.id)}
                          className="text-xs text-blue-600 hover:text-blue-700"
                        >
                          {isExpanded ? '▲ Collapse' : '▼ Expand'}
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full ${getCapacityColor(totalAllocation)}`}
                            style={{ width: `${Math.min(totalAllocation, 100)}%` }}
                          />
                        </div>
                        <span className={`text-sm font-medium ${totalAllocation >= 101 ? 'text-red-600' : 'text-gray-900'}`}>
                          {totalAllocation}%
                        </span>
                      </div>
                      {totalAllocation >= 101 && (
                        <p className="text-xs text-red-600 mt-1">🚨 Over-allocated by {totalAllocation - 100}%!</p>
                      )}

                      {isExpanded && (
                        <div className="mt-3 space-y-2 border-t pt-3">
                          <p className="text-xs font-medium text-gray-700">Project Breakdown (Active on 2026-01-07):</p>
                          {userAllocations.length === 0 ? (
                            <p className="text-xs text-gray-500">No active allocations for selected date range</p>
                          ) : (
                            userAllocations.map((alloc) => (
                              <div key={alloc.id} className="bg-gray-50 p-2 rounded">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">{alloc.projectName}</p>
                                    <p className="text-xs text-gray-500">{alloc.role}</p>
                                    <p className="text-xs text-gray-400">
                                      {alloc.startDate} → {alloc.endDate}
                                    </p>
                                  </div>
                                  <span className="text-sm font-semibold text-gray-900">{alloc.percentage}%</span>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Roles Tab */}
        {activeTab === 'roles' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Roles</h2>
              <button
                onClick={() => {
                  setEditingRole(null);
                  setRoleFormData({ name: '', description: '', requiredSkills: [] });
                  setShowAddEditRoleModal(true);
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                + Add New Role
              </button>
            </div>

            {/* Roles Grid */}
            <div className="grid grid-cols-1 gap-4">
              {roles.map((role) => {
                // Count projects using this role
                const projectsUsingRole = DEMO_ALLOCATIONS.filter(a => a.role === role.name);
                const uniqueProjectIds = [...new Set(projectsUsingRole.map(a => a.projectId))];
                const associatedProjects = projects.filter(p => uniqueProjectIds.includes(p.id));
                const canDelete = projectsUsingRole.length === 0;

                return (
                  <div key={role.id} className="bg-white rounded-lg shadow border border-gray-200 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{role.name}</h3>
                        <p className="text-sm text-gray-600 mb-4">{role.description}</p>

                        {/* Required Skills */}
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">Required Skills:</p>
                          <div className="flex flex-wrap gap-2">
                            {role.requiredSkills.map((skill: string, idx: number) => (
                              <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Associated Projects */}
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">
                            Associated Projects ({associatedProjects.length}):
                          </p>
                          {associatedProjects.length > 0 ? (
                            <div className="space-y-2">
                              {associatedProjects.map((project) => {
                                const roleAllocations = projectsUsingRole.filter(a => a.projectId === project.id);
                                const dropdownKey = `role-${role.id}-project-${project.id}`;
                                const isOpen = openDropdowns[dropdownKey];

                                return (
                                  <div key={project.id} className="bg-gray-50 p-3 rounded">
                                    <div className="flex items-center justify-between">
                                      <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900">{project.name}</p>
                                        <button
                                          onClick={() => setOpenDropdowns({ ...openDropdowns, [dropdownKey]: !isOpen })}
                                          className="text-xs text-blue-600 hover:text-blue-800 mt-1"
                                        >
                                          {roleAllocations.length} {roleAllocations.length === 1 ? 'person' : 'people'} assigned {isOpen ? '▲' : '▼'}
                                        </button>
                                      </div>
                                      <span className={`px-2 py-1 text-xs rounded-full ${
                                        project.priority === 'critical' ? 'bg-red-100 text-red-700' :
                                        project.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                                        project.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-gray-100 text-gray-700'
                                      }`}>
                                        {project.priority}
                                      </span>
                                    </div>

                                    {/* People dropdown */}
                                    {isOpen && (
                                      <div className="mt-3 space-y-2 pl-2 border-l-2 border-blue-200">
                                        {roleAllocations.map((allocation) => {
                                          const user = DEMO_USERS.find(u => u.id === allocation.userId);
                                          if (!user) return null;

                                          return (
                                            <div key={allocation.id} className="flex items-center justify-between text-xs">
                                              <div>
                                                <p className="font-medium text-gray-900">{user.name}</p>
                                                <p className="text-gray-500">
                                                  {allocation.startDate} to {allocation.endDate}
                                                </p>
                                              </div>
                                              <div className="text-right">
                                                <p className="text-gray-700">{allocation.expectedHours || 0}h expected</p>
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500 italic">No projects currently using this role</p>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => {
                            setEditingRole(role);
                            setRoleFormData({
                              name: role.name,
                              description: role.description,
                              requiredSkills: role.requiredSkills
                            });
                            setShowAddEditRoleModal(true);
                          }}
                          className="px-3 py-1 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setRoleToDelete({ id: role.id, name: role.name });
                            setShowDeleteRoleModal(true);
                          }}
                          className="px-3 py-1 text-sm rounded-md bg-red-600 text-white hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {roles.length === 0 && (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <p className="text-gray-500">No roles defined yet. Click "Add New Role" to create one.</p>
              </div>
            )}
          </div>
        )}

        {/* Timeline Tab */}
        {activeTab === 'timeline' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Capacity Timeline</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const allProjectIds = filteredTimelineProjects.map(p => p.id);
                    setExpandedProjects(allProjectIds);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  Expand All
                </button>
                <button
                  onClick={() => setExpandedProjects([])}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
                >
                  Collapse All
                </button>
              </div>
            </div>

            {/* Timeline Filters */}
            <div className="bg-white rounded-lg shadow p-4 mb-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
                  <input
                    type="date"
                    value={timelineFilters.dateFrom}
                    onChange={(e) => setTimelineFilters({...timelineFilters, dateFrom: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
                  <input
                    type="date"
                    value={timelineFilters.dateTo}
                    onChange={(e) => setTimelineFilters({...timelineFilters, dateTo: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Search User</label>
                  <input
                    type="text"
                    placeholder="Type to search..."
                    value={timelineFilters.user}
                    onChange={(e) => setTimelineFilters({...timelineFilters, user: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <div className="flex flex-col gap-1 pt-1">
                    {uniquePriorities.map(priority => (
                      <label key={priority} className="flex items-center gap-1 text-xs">
                        <input
                          type="checkbox"
                          checked={timelineFilters.priority.includes(priority)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setTimelineFilters({...timelineFilters, priority: [...timelineFilters.priority, priority]});
                            } else {
                              setTimelineFilters({...timelineFilters, priority: timelineFilters.priority.filter(p => p !== priority)});
                            }
                          }}
                          className="rounded"
                        />
                        {priority}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Workstream</label>
                  <div className="relative dropdown-container">
                    <button
                      data-dropdown
                      onClick={() => toggleDropdown('timeline-workstream')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-left bg-white hover:bg-gray-50 flex justify-between items-center"
                    >
                      <span className="truncate">
                        {timelineFilters.workstream.length === 0 ? 'All Workstreams' : `${timelineFilters.workstream.length} selected`}
                      </span>
                      <span className="ml-2">▼</span>
                    </button>
                    {openDropdowns['timeline-workstream'] && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg" style={{ minWidth: '280px' }}>
                        {excelFilterMode && (
                          <div className="p-2 border-b border-gray-200 bg-gray-50">
                            <input
                              type="text"
                              placeholder="Search..."
                              value={dropdownSearches['timeline-workstream'] || ''}
                              onChange={(e) => updateDropdownSearch('timeline-workstream', e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded mb-2"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div className="flex justify-between items-center">
                              <div className="flex gap-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const filtered = getFilteredAndSortedOptions('timeline-workstream', uniqueWorkstreams);
                                    setTimelineFilters({...timelineFilters, workstream: [...new Set([...timelineFilters.workstream, ...filtered])]});
                                  }}
                                  className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded"
                                >
                                  Select All
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setTimelineFilters({...timelineFilters, workstream: []});
                                  }}
                                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded"
                                >
                                  Clear
                                </button>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleDropdownSort('timeline-workstream');
                                }}
                                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded flex items-center gap-1"
                              >
                                {dropdownSortOrders['timeline-workstream'] === 'desc' ? 'Z-A' : 'A-Z'}
                                <span>{dropdownSortOrders['timeline-workstream'] === 'desc' ? '↓' : '↑'}</span>
                              </button>
                            </div>
                          </div>
                        )}
                        <div className="max-h-48 overflow-auto">
                          {getFilteredAndSortedOptions('timeline-workstream', uniqueWorkstreams).map(ws => (
                            <label key={ws} className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={timelineFilters.workstream.includes(ws)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setTimelineFilters({...timelineFilters, workstream: [...timelineFilters.workstream, ws]});
                                  } else {
                                    setTimelineFilters({...timelineFilters, workstream: timelineFilters.workstream.filter(w => w !== ws)});
                                  }
                                }}
                                className="rounded mr-2"
                              />
                              <span className="text-sm">{ws}</span>
                            </label>
                          ))}
                          {getFilteredAndSortedOptions('timeline-workstream', uniqueWorkstreams).length === 0 && (
                            <div className="px-3 py-2 text-sm text-gray-500 italic">No matches found</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tempo Team</label>
                  <div className="relative dropdown-container">
                    <button
                      data-dropdown
                      onClick={() => toggleDropdown('timeline-tempoTeam')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-left bg-white hover:bg-gray-50 flex justify-between items-center"
                    >
                      <span className="truncate">
                        {timelineFilters.tempoTeam.length === 0 ? 'All Teams' : `${timelineFilters.tempoTeam.length} selected`}
                      </span>
                      <span className="ml-2">▼</span>
                    </button>
                    {openDropdowns['timeline-tempoTeam'] && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg" style={{ minWidth: '280px' }}>
                        {excelFilterMode && (
                          <div className="p-2 border-b border-gray-200 bg-gray-50">
                            <input
                              type="text"
                              placeholder="Search..."
                              value={dropdownSearches['timeline-tempoTeam'] || ''}
                              onChange={(e) => updateDropdownSearch('timeline-tempoTeam', e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded mb-2"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div className="flex justify-between items-center">
                              <div className="flex gap-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const filtered = getFilteredAndSortedOptions('timeline-tempoTeam', uniqueTempoTeams);
                                    setTimelineFilters({...timelineFilters, tempoTeam: [...new Set([...timelineFilters.tempoTeam, ...filtered])]});
                                  }}
                                  className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded"
                                >
                                  Select All
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setTimelineFilters({...timelineFilters, tempoTeam: []});
                                  }}
                                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded"
                                >
                                  Clear
                                </button>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleDropdownSort('timeline-tempoTeam');
                                }}
                                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded flex items-center gap-1"
                              >
                                {dropdownSortOrders['timeline-tempoTeam'] === 'desc' ? 'Z-A' : 'A-Z'}
                                <span>{dropdownSortOrders['timeline-tempoTeam'] === 'desc' ? '↓' : '↑'}</span>
                              </button>
                            </div>
                          </div>
                        )}
                        <div className="max-h-48 overflow-auto">
                          {getFilteredAndSortedOptions('timeline-tempoTeam', uniqueTempoTeams).map(team => (
                            <label key={team} className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={timelineFilters.tempoTeam.includes(team)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setTimelineFilters({...timelineFilters, tempoTeam: [...timelineFilters.tempoTeam, team]});
                                  } else {
                                    setTimelineFilters({...timelineFilters, tempoTeam: timelineFilters.tempoTeam.filter(t => t !== team)});
                                  }
                                }}
                                className="rounded mr-2"
                              />
                              <span className="text-sm">{team}</span>
                            </label>
                          ))}
                          {getFilteredAndSortedOptions('timeline-tempoTeam', uniqueTempoTeams).length === 0 && (
                            <div className="px-3 py-2 text-sm text-gray-500 italic">No matches found</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <div className="relative dropdown-container">
                    <button
                      data-dropdown
                      onClick={() => toggleDropdown('timeline-role')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-left bg-white hover:bg-gray-50 flex justify-between items-center"
                    >
                      <span className="truncate">
                        {timelineFilters.role.length === 0 ? 'All Roles' : `${timelineFilters.role.length} selected`}
                      </span>
                      <span className="ml-2">▼</span>
                    </button>
                    {openDropdowns['timeline-role'] && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg" style={{ minWidth: '280px' }}>
                        {excelFilterMode && (
                          <div className="p-2 border-b border-gray-200 bg-gray-50">
                            <input
                              type="text"
                              placeholder="Search..."
                              value={dropdownSearches['timeline-role'] || ''}
                              onChange={(e) => updateDropdownSearch('timeline-role', e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded mb-2"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div className="flex justify-between items-center">
                              <div className="flex gap-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const filtered = getFilteredAndSortedOptions('timeline-role', uniqueRoles);
                                    setTimelineFilters({...timelineFilters, role: [...new Set([...timelineFilters.role, ...filtered])]});
                                  }}
                                  className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded"
                                >
                                  Select All
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setTimelineFilters({...timelineFilters, role: []});
                                  }}
                                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded"
                                >
                                  Clear
                                </button>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleDropdownSort('timeline-role');
                                }}
                                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded flex items-center gap-1"
                              >
                                {dropdownSortOrders['timeline-role'] === 'desc' ? 'Z-A' : 'A-Z'}
                                <span>{dropdownSortOrders['timeline-role'] === 'desc' ? '↓' : '↑'}</span>
                              </button>
                            </div>
                          </div>
                        )}
                        <div className="max-h-48 overflow-auto">
                          {getFilteredAndSortedOptions('timeline-role', uniqueRoles).map(role => (
                            <label key={role} className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={timelineFilters.role.includes(role)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setTimelineFilters({...timelineFilters, role: [...timelineFilters.role, role]});
                                  } else {
                                    setTimelineFilters({...timelineFilters, role: timelineFilters.role.filter(r => r !== role)});
                                  }
                                }}
                                className="rounded mr-2"
                              />
                              <span className="text-sm">{role}</span>
                            </label>
                          ))}
                          {getFilteredAndSortedOptions('timeline-role', uniqueRoles).length === 0 && (
                            <div className="px-3 py-2 text-sm text-gray-500 italic">No matches found</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Skill</label>
                  <div className="relative dropdown-container">
                    <button
                      data-dropdown
                      onClick={() => toggleDropdown('timeline-skill')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-left bg-white hover:bg-gray-50 flex justify-between items-center"
                    >
                      <span className="truncate">
                        {timelineFilters.skill.length === 0 ? 'All Skills' : `${timelineFilters.skill.length} selected`}
                      </span>
                      <span className="ml-2">▼</span>
                    </button>
                    {openDropdowns['timeline-skill'] && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg" style={{ minWidth: '280px' }}>
                        {excelFilterMode && (
                          <div className="p-2 border-b border-gray-200 bg-gray-50">
                            <input
                              type="text"
                              placeholder="Search..."
                              value={dropdownSearches['timeline-skill'] || ''}
                              onChange={(e) => updateDropdownSearch('timeline-skill', e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded mb-2"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div className="flex justify-between items-center">
                              <div className="flex gap-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const filtered = getFilteredAndSortedOptions('timeline-skill', uniqueSkills);
                                    setTimelineFilters({...timelineFilters, skill: [...new Set([...timelineFilters.skill, ...filtered])]});
                                  }}
                                  className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded"
                                >
                                  Select All
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setTimelineFilters({...timelineFilters, skill: []});
                                  }}
                                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded"
                                >
                                  Clear
                                </button>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleDropdownSort('timeline-skill');
                                }}
                                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded flex items-center gap-1"
                              >
                                {dropdownSortOrders['timeline-skill'] === 'desc' ? 'Z-A' : 'A-Z'}
                                <span>{dropdownSortOrders['timeline-skill'] === 'desc' ? '↓' : '↑'}</span>
                              </button>
                            </div>
                          </div>
                        )}
                        <div className="max-h-48 overflow-auto">
                          {getFilteredAndSortedOptions('timeline-skill', uniqueSkills).map(skill => (
                            <label key={skill} className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={timelineFilters.skill.includes(skill)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setTimelineFilters({...timelineFilters, skill: [...timelineFilters.skill, skill]});
                                  } else {
                                    setTimelineFilters({...timelineFilters, skill: timelineFilters.skill.filter((s: string) => s !== skill)});
                                  }
                                }}
                                className="rounded mr-2"
                              />
                              <span className="text-sm">{skill}</span>
                            </label>
                          ))}
                          {getFilteredAndSortedOptions('timeline-skill', uniqueSkills).length === 0 && (
                            <div className="px-3 py-2 text-sm text-gray-500 italic">No matches found</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <div className="relative dropdown-container">
                    <button
                      data-dropdown
                      onClick={() => toggleDropdown('timeline-status')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-left bg-white hover:bg-gray-50 flex justify-between items-center"
                    >
                      <span className="truncate">
                        {timelineFilters.status.length === 0 ? 'All Statuses' : `${timelineFilters.status.length} selected`}
                      </span>
                      <span className="ml-2">▼</span>
                    </button>
                    {openDropdowns['timeline-status'] && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg" style={{ minWidth: '280px' }}>
                        {excelFilterMode && (
                          <div className="p-2 border-b border-gray-200 bg-gray-50">
                            <input
                              type="text"
                              placeholder="Search..."
                              value={dropdownSearches['timeline-status'] || ''}
                              onChange={(e) => updateDropdownSearch('timeline-status', e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded mb-2"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div className="flex justify-between items-center">
                              <div className="flex gap-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const filtered = getFilteredAndSortedOptions('timeline-status', uniqueStatuses, (s) => statusDisplayNames[s] || s);
                                    setTimelineFilters({...timelineFilters, status: [...new Set([...timelineFilters.status, ...filtered])]});
                                  }}
                                  className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded"
                                >
                                  Select All
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setTimelineFilters({...timelineFilters, status: []});
                                  }}
                                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded"
                                >
                                  Clear
                                </button>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleDropdownSort('timeline-status');
                                }}
                                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded flex items-center gap-1"
                              >
                                {dropdownSortOrders['timeline-status'] === 'desc' ? 'Z-A' : 'A-Z'}
                                <span>{dropdownSortOrders['timeline-status'] === 'desc' ? '↓' : '↑'}</span>
                              </button>
                            </div>
                          </div>
                        )}
                        <div className="max-h-48 overflow-auto">
                          {getFilteredAndSortedOptions('timeline-status', uniqueStatuses, (s) => statusDisplayNames[s] || s).map(status => (
                            <label key={status} className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={timelineFilters.status.includes(status)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setTimelineFilters({...timelineFilters, status: [...timelineFilters.status, status]});
                                  } else {
                                    setTimelineFilters({...timelineFilters, status: timelineFilters.status.filter((s: string) => s !== status)});
                                  }
                                }}
                                className="rounded mr-2"
                              />
                              <span className="text-sm">{statusDisplayNames[status] || status}</span>
                            </label>
                          ))}
                          {getFilteredAndSortedOptions('timeline-status', uniqueStatuses, (s) => statusDisplayNames[s] || s).length === 0 && (
                            <div className="px-3 py-2 text-sm text-gray-500 italic">No matches found</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jira Project</label>
                  <div className="relative dropdown-container">
                    <button
                      data-dropdown
                      onClick={() => toggleDropdown('timeline-jiraspace')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-left bg-white hover:bg-gray-50 flex justify-between items-center"
                    >
                      <span className="truncate">
                        {timelineFilters.jiraSpace.length === 0 ? 'All Projects' : `${timelineFilters.jiraSpace.length} selected`}
                      </span>
                      <span className="ml-2">▼</span>
                    </button>
                    {openDropdowns['timeline-jiraspace'] && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg" style={{ minWidth: '280px' }}>
                        {excelFilterMode && (
                          <div className="p-2 border-b border-gray-200 bg-gray-50">
                            <input
                              type="text"
                              placeholder="Search..."
                              value={dropdownSearches['timeline-jiraspace'] || ''}
                              onChange={(e) => updateDropdownSearch('timeline-jiraspace', e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded mb-2"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div className="flex justify-between items-center">
                              <div className="flex gap-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const filtered = getFilteredAndSortedOptions('timeline-jiraspace', uniqueJiraProjects, (p) => p.name);
                                    setTimelineFilters({...timelineFilters, jiraSpace: [...new Set([...timelineFilters.jiraSpace, ...filtered.map(p => p.id)])]});
                                  }}
                                  className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded"
                                >
                                  Select All
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setTimelineFilters({...timelineFilters, jiraSpace: []});
                                  }}
                                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded"
                                >
                                  Clear
                                </button>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleDropdownSort('timeline-jiraspace');
                                }}
                                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded flex items-center gap-1"
                              >
                                {dropdownSortOrders['timeline-jiraspace'] === 'desc' ? 'Z-A' : 'A-Z'}
                                <span>{dropdownSortOrders['timeline-jiraspace'] === 'desc' ? '↓' : '↑'}</span>
                              </button>
                            </div>
                          </div>
                        )}
                        <div className="max-h-48 overflow-auto">
                          {getFilteredAndSortedOptions('timeline-jiraspace', uniqueJiraProjects, (p) => p.name).map(project => (
                            <label key={project.id} className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={timelineFilters.jiraSpace.includes(project.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setTimelineFilters({...timelineFilters, jiraSpace: [...timelineFilters.jiraSpace, project.id]});
                                  } else {
                                    setTimelineFilters({...timelineFilters, jiraSpace: timelineFilters.jiraSpace.filter(id => id !== project.id)});
                                  }
                                }}
                                className="rounded mr-2"
                              />
                              <span className="text-sm">{project.name}</span>
                            </label>
                          ))}
                          {getFilteredAndSortedOptions('timeline-jiraspace', uniqueJiraProjects, (p) => p.name).length === 0 && (
                            <div className="px-3 py-2 text-sm text-gray-500 italic">No matches found</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="flex items-center gap-2 text-xs mb-2">
                    <input
                      type="checkbox"
                      checked={timelineFilters.missingRoles}
                      onChange={(e) => setTimelineFilters({...timelineFilters, missingRoles: e.target.checked})}
                      className="rounded"
                    />
                    Show Missing Roles Only
                  </label>
                  <button
                    onClick={() => setTimelineFilters({priority: [], workstream: [], tempoTeam: [], role: [], skill: [], status: [], missingRoles: false, user: '', dateFrom: '2026-01-01', dateTo: '2026-12-31', jiraSpace: []})}
                    className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>

            {/* Timeline View Mode Selector */}
            <div className="bg-white rounded-lg shadow p-4 mb-4">
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700">Timeline View:</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setTimelineViewMode('weekly')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      timelineViewMode === 'weekly'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Weekly
                  </button>
                  <button
                    onClick={() => setTimelineViewMode('monthly')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      timelineViewMode === 'monthly'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setTimelineViewMode('quarterly')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      timelineViewMode === 'quarterly'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Quarterly
                  </button>
                  <button
                    onClick={() => setTimelineViewMode('yearly')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      timelineViewMode === 'yearly'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Yearly
                  </button>
                </div>
              </div>
            </div>

            {/* Timeline Visualization */}
            <div className="bg-white rounded-lg shadow p-6 overflow-x-auto">
              <div className="min-w-[1000px]">
                {/* Timeline Header */}
                <div className="flex border-b pb-2 mb-4">
                  <div className="w-64 font-semibold text-sm text-gray-700">Project / Role</div>
                  <div className="flex-1 gap-1" style={{ display: 'grid', gridTemplateColumns: `repeat(${timelineColumns.length}, minmax(0, 1fr))` }}>
                    {timelineColumns.map((col, idx) => (
                      <div key={idx} className="text-center text-xs font-medium text-gray-500">{col.label}</div>
                    ))}
                  </div>
                </div>

                {/* Timeline Rows by Project with Roles */}
                {filteredTimelineProjects.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No projects match the selected filters</p>
                ) : (
                  filteredTimelineProjects.map((project) => {
                    const projectColor = project.priority === 'critical' ? 'bg-red-400' : project.priority === 'high' ? 'bg-orange-400' : 'bg-blue-400';
                    const projectPosition = getProjectPosition(project.startDate, project.endDate, timelineColumns);
                    const projectAllocs = DEMO_ALLOCATIONS.filter(a => a.projectId === project.id);
                    const roleGroups: Record<string, typeof DEMO_ALLOCATIONS> = {};
                    projectAllocs.forEach(alloc => {
                      if (!roleGroups[alloc.role]) roleGroups[alloc.role] = [];
                      roleGroups[alloc.role].push(alloc);
                    });
                    const isExpanded = expandedProjects.includes(project.id);

                    if (!projectPosition) return null;

                    return (
                      <div key={project.id} className="mb-6">
                        <div className="flex items-center mb-2">
                          <div className="w-64 text-sm font-semibold text-gray-900 flex items-center gap-3">
                            <button
                              onClick={() => toggleProjectExpansion(project.id)}
                              className="text-blue-600 hover:text-blue-700 font-bold"
                            >
                              {isExpanded ? '▼' : '▶'}
                            </button>
                            <span className="flex-1 truncate">{project.name}</span>
                          </div>
                          <div className="flex items-center gap-2 ml-3">
                            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm border ${statusColors[project.status]} border-opacity-30`}>
                              <span className="w-1.5 h-1.5 rounded-full mr-2 bg-current opacity-70"></span>
                              {statusDisplayNames[project.status] || project.status}
                            </span>
                          </div>
                          <div className="flex-1 gap-1 relative" style={{ display: 'grid', gridTemplateColumns: `repeat(${timelineColumns.length}, minmax(0, 1fr))` }}>
                            <div
                              className={`${projectColor} rounded px-2 py-1 text-xs text-white font-medium truncate`}
                              style={{
                                gridColumnStart: projectPosition.startCol,
                                gridColumnEnd: projectPosition.startCol + projectPosition.span,
                              }}
                            >
                              {project.name.substring(0, 20)}
                            </div>
                          </div>
                        </div>
                        {/* Roles under project (collapsible) */}
                        {isExpanded && (() => {
                          // Combine required roles with allocated roles
                          const allRoles = new Set([...project.requiredRoles, ...Object.keys(roleGroups)]);
                          return Array.from(allRoles).map(role => {
                            const allocations = roleGroups[role] || [];
                            const isUnassigned = allocations.length === 0;

                            return (
                              <div key={role} className="ml-6 mb-2">
                                <div className="flex items-center">
                                  <div className="w-56 text-xs font-medium text-gray-700 pl-2">
                                    {role}
                                  </div>
                                  <div className="flex-1 gap-1 relative" style={{ display: 'grid', gridTemplateColumns: `repeat(${timelineColumns.length}, minmax(0, 1fr))` }}>
                                    {isUnassigned ? (
                                      // Blank bar for unassigned roles spanning project duration
                                      <div
                                        className="bg-gray-100 border-2 border-dashed border-gray-300 rounded px-1 py-0.5 text-xs text-gray-500"
                                        style={{
                                          gridColumnStart: projectPosition.startCol,
                                          gridColumnEnd: projectPosition.startCol + projectPosition.span,
                                        }}
                                      >
                                        Unassigned
                                      </div>
                                    ) : (
                                      // Show user bars for assigned roles
                                      allocations.map((allocation) => {
                                        const allocPosition = getProjectPosition(allocation.startDate, allocation.endDate, timelineColumns);
                                        if (!allocPosition) return null;

                                        return (
                                          <div
                                            key={allocation.id}
                                            className="bg-blue-200 border border-blue-300 rounded px-1 py-0.5 text-xs text-blue-900 truncate"
                                            style={{
                                              gridColumnStart: allocPosition.startCol,
                                              gridColumnEnd: allocPosition.startCol + allocPosition.span,
                                            }}
                                          >
                                            {allocation.userName.split(' ')[0]} ({allocation.percentage}%)
                                          </div>
                                        );
                                      })
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="text-sm font-medium text-gray-500">Visible Projects</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {filteredTimelineProjects.length}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="text-sm font-medium text-gray-500">Total Allocations</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">{DEMO_ALLOCATIONS.length}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="text-sm font-medium text-gray-500">Team Members</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">{DEMO_USERS.length}</p>
              </div>
            </div>
          </div>
        )}

        {/* Actuals Tab */}
        {activeTab === 'actuals' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Planned vs Actuals</h2>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-4 mb-4">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
                  <input
                    type="date"
                    value={actualsFilters.dateFrom}
                    onChange={(e) => setActualsFilters({...actualsFilters, dateFrom: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
                  <input
                    type="date"
                    value={actualsFilters.dateTo}
                    onChange={(e) => setActualsFilters({...actualsFilters, dateTo: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    value={actualsFilters.role}
                    onChange={(e) => setActualsFilters({...actualsFilters, role: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="">All Roles</option>
                    {uniqueRoles.map(role => <option key={role} value={role}>{role}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">User</label>
                  <select
                    value={actualsFilters.user}
                    onChange={(e) => setActualsFilters({...actualsFilters, user: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="">All Users</option>
                    {uniqueUsers.map(user => <option key={user} value={user}>{user}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account (CapEx/OpEx)</label>
                  <select
                    value={actualsFilters.account}
                    onChange={(e) => setActualsFilters({...actualsFilters, account: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="">All Accounts</option>
                    <option value="CapEx">CapEx</option>
                    <option value="OpEx">OpEx</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => setActualsFilters({dateFrom: '', dateTo: '', role: '', user: '', account: '', jiraSpace: []})}
                    className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>

            {/* Executive Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Total Planned Hours</h3>
                <p className="text-3xl font-bold text-blue-600">{actualsSummary.totalPlanned}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Total Actual Hours</h3>
                <p className="text-3xl font-bold text-green-600">{actualsSummary.totalActual}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Variance (Hours)</h3>
                <p className={`text-3xl font-bold ${actualsSummary.variance >= 0 ? 'text-orange-600' : 'text-green-600'}`}>
                  {actualsSummary.variance > 0 ? '+' : ''}{actualsSummary.variance}
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Variance (%)</h3>
                <p className={`text-3xl font-bold ${Number(actualsSummary.variancePercent) >= 0 ? 'text-orange-600' : 'text-green-600'}`}>
                  {Number(actualsSummary.variancePercent) > 0 ? '+' : ''}{actualsSummary.variancePercent}%
                </p>
              </div>
            </div>

            {/* Line Graph - Trend Over Time */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Weekly Trend: Planned vs Actual</h3>
              <p className="text-sm text-gray-500 mb-6">Visual representation of capacity utilization over time</p>
              <div className="border-l-2 border-b-2 border-gray-300 pl-4 pb-4 h-64 flex items-end gap-4">
                {Array.from(new Set(filteredActuals.map(a => a.week))).sort().map((week, idx) => {
                  const weekData = filteredActuals.filter(a => a.week === week);
                  const planned = weekData.reduce((sum, a) => sum + a.plannedHours, 0);
                  const actual = weekData.reduce((sum, a) => sum + a.actualHours, 0);
                  const maxHeight = 200;
                  const maxValue = Math.max(...filteredActuals.map(a => Math.max(a.plannedHours, a.actualHours))) * 2;
                  const plannedHeight = maxValue > 0 ? (planned / maxValue) * maxHeight : 0;
                  const actualHeight = maxValue > 0 ? (actual / maxValue) * maxHeight : 0;

                  return (
                    <div key={week} className="flex-1 flex flex-col items-center gap-1">
                      <div className="flex gap-1 items-end h-48">
                        <div
                          className="bg-blue-400 w-4 rounded-t"
                          style={{ height: `${plannedHeight}px` }}
                          title={`Planned: ${planned}h`}
                        />
                        <div
                          className="bg-green-400 w-4 rounded-t"
                          style={{ height: `${actualHeight}px` }}
                          title={`Actual: ${actual}h`}
                        />
                      </div>
                      <span className="text-xs text-gray-500 transform -rotate-45 origin-top-left mt-2">
                        {week.substring(5)}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-center gap-6 mt-6">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-400 rounded"></div>
                  <span className="text-sm text-gray-700">Planned</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-400 rounded"></div>
                  <span className="text-sm text-gray-700">Actual</span>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Pie Chart - By Role */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Hours by Role</h3>
                <div className="space-y-3">
                  {Object.entries(actualsSummary.byRole).map(([role, data]) => {
                    const total = actualsSummary.totalPlanned;
                    const percentage = total > 0 ? ((data.planned / total) * 100).toFixed(1) : 0;
                    return (
                      <div key={role} className="border-b pb-2">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium text-gray-700">{role}</span>
                          <span className="text-xs text-gray-500">{percentage}%</span>
                        </div>
                        <div className="flex gap-4 text-xs">
                          <span className="text-blue-600">Planned: {data.planned}h</span>
                          <span className="text-green-600">Actual: {data.actual}h</span>
                          <span className={data.actual - data.planned >= 0 ? 'text-orange-600' : 'text-green-600'}>
                            Var: {data.actual - data.planned > 0 ? '+' : ''}{data.actual - data.planned}h
                          </span>
                        </div>
                        <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bar Chart - By User */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Hours by Team Member</h3>
                <div className="space-y-3">
                  {Object.entries(actualsSummary.byUser).map(([user, data]) => {
                    const maxHours = Math.max(...Object.values(actualsSummary.byUser).map(d => Math.max(d.planned, d.actual)));
                    const plannedWidth = maxHours > 0 ? (data.planned / maxHours) * 100 : 0;
                    const actualWidth = maxHours > 0 ? (data.actual / maxHours) * 100 : 0;
                    return (
                      <div key={user} className="border-b pb-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium text-gray-700">{user}</span>
                          <span className={`text-xs ${data.actual - data.planned >= 0 ? 'text-orange-600' : 'text-green-600'}`}>
                            {data.actual - data.planned > 0 ? '+' : ''}{data.actual - data.planned}h
                          </span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-blue-600 w-16">Planned:</span>
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-500 h-2 rounded-full"
                                style={{ width: `${plannedWidth}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-600 w-12">{data.planned}h</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-green-600 w-16">Actual:</span>
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-500 h-2 rounded-full"
                                style={{ width: `${actualWidth}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-600 w-12">{data.actual}h</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* New Project Capacity Charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Projects with Highest Actual Capacity */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Projects with Highest Actual Capacity</h3>
                <p className="text-xs text-gray-500 mb-4">Sorted by actual hours logged</p>
                <div className="space-y-3">
                  {(() => {
                    const projectActuals: Record<string, { actual: number; planned: number; dateRange: string }> = {};
                    filteredActuals.forEach(a => {
                      if (!projectActuals[a.projectId]) {
                        const project = DEMO_PROJECTS.find(p => p.id === a.projectId);
                        projectActuals[a.projectId] = {
                          actual: 0,
                          planned: 0,
                          dateRange: project ? `${project.startDate} - ${project.endDate}` : 'N/A'
                        };
                      }
                      projectActuals[a.projectId].actual += a.actualHours;
                      projectActuals[a.projectId].planned += a.plannedHours;
                    });

                    const sortedProjects = Object.entries(projectActuals)
                      .map(([projectId, data]) => ({
                        projectId,
                        projectName: DEMO_PROJECTS.find(p => p.id === projectId)?.name || 'Unknown',
                        ...data
                      }))
                      .sort((a, b) => b.actual - a.actual)
                      .slice(0, 5);

                    const maxActual = Math.max(...sortedProjects.map(p => p.actual));

                    return sortedProjects.map(project => (
                      <div key={project.projectId} className="border-b pb-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium text-gray-700">{project.projectName}</span>
                          <span className="text-xs text-green-600 font-semibold">{project.actual}h</span>
                        </div>
                        <div className="text-xs text-gray-500 mb-2">{project.dateRange}</div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-green-500 h-3 rounded-full flex items-center justify-end pr-2"
                            style={{ width: `${maxActual > 0 ? (project.actual / maxActual) * 100 : 0}%` }}
                          >
                            <span className="text-xs text-white font-medium">{project.actual}h</span>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Planned: {project.planned}h | Variance: {project.actual - project.planned > 0 ? '+' : ''}{project.actual - project.planned}h
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>

              {/* Projects with Highest Planned Capacity */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Projects with Highest Planned Capacity</h3>
                <p className="text-xs text-gray-500 mb-4">Sorted by planned hours</p>
                <div className="space-y-3">
                  {(() => {
                    const projectPlanned: Record<string, { actual: number; planned: number; dateRange: string }> = {};
                    filteredActuals.forEach(a => {
                      if (!projectPlanned[a.projectId]) {
                        const project = DEMO_PROJECTS.find(p => p.id === a.projectId);
                        projectPlanned[a.projectId] = {
                          actual: 0,
                          planned: 0,
                          dateRange: project ? `${project.startDate} - ${project.endDate}` : 'N/A'
                        };
                      }
                      projectPlanned[a.projectId].actual += a.actualHours;
                      projectPlanned[a.projectId].planned += a.plannedHours;
                    });

                    const sortedProjects = Object.entries(projectPlanned)
                      .map(([projectId, data]) => ({
                        projectId,
                        projectName: DEMO_PROJECTS.find(p => p.id === projectId)?.name || 'Unknown',
                        ...data
                      }))
                      .sort((a, b) => b.planned - a.planned)
                      .slice(0, 5);

                    const maxPlanned = Math.max(...sortedProjects.map(p => p.planned));

                    return sortedProjects.map(project => (
                      <div key={project.projectId} className="border-b pb-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium text-gray-700">{project.projectName}</span>
                          <span className="text-xs text-blue-600 font-semibold">{project.planned}h</span>
                        </div>
                        <div className="text-xs text-gray-500 mb-2">{project.dateRange}</div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-blue-500 h-3 rounded-full flex items-center justify-end pr-2"
                            style={{ width: `${maxPlanned > 0 ? (project.planned / maxPlanned) * 100 : 0}%` }}
                          >
                            <span className="text-xs text-white font-medium">{project.planned}h</span>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Actual: {project.actual}h | Variance: {project.actual - project.planned > 0 ? '+' : ''}{project.actual - project.planned}h
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Admin Tab */}
        {activeTab === 'admin' && currentUser.roles.includes('Admin') && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">API Integration Admin</h2>

            {/* API Connections Section */}
            <div className="bg-white rounded-lg shadow mb-6">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">API Connections</h3>

                {/* Jira Connection */}
                <div className="mb-6 p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-gray-900">Jira Cloud</h4>
                      <p className="text-sm text-gray-500">Connect to Jira for project and issue management</p>
                    </div>
                    <span className="px-3 py-1 text-sm rounded-full bg-gray-100 text-gray-600">
                      Not Connected
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Jira Base URL
                      </label>
                      <input
                        type="text"
                        placeholder="https://your-domain.atlassian.net"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        value={jiraCredentials.baseUrl}
                        onChange={(e) => setJiraCredentials({ ...jiraCredentials, baseUrl: e.target.value })}
                      />
                      <p className="text-xs text-gray-500 mt-1">Your Jira instance URL</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        placeholder="your.email@example.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        value={jiraCredentials.email}
                        onChange={(e) => setJiraCredentials({ ...jiraCredentials, email: e.target.value })}
                      />
                      <p className="text-xs text-gray-500 mt-1">Your Atlassian account email</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        API Token
                      </label>
                      <input
                        type="password"
                        placeholder="••••••••••••••••"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        value={jiraCredentials.apiToken}
                        onChange={(e) => setJiraCredentials({ ...jiraCredentials, apiToken: e.target.value })}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Generate from: <a href="https://id.atlassian.com/manage-profile/security/api-tokens" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://id.atlassian.com/manage-profile/security/api-tokens</a>
                      </p>
                    </div>

                    {jiraConnectionStatus && (
                      <div className={`p-3 rounded-md text-sm ${
                        jiraConnectionStatus.includes('success') || jiraConnectionStatus.includes('Success')
                          ? 'bg-green-50 text-green-800 border border-green-200'
                          : 'bg-red-50 text-red-800 border border-red-200'
                      }`}>
                        {jiraConnectionStatus}
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={async () => {
                          if (!jiraCredentials.baseUrl || !jiraCredentials.email || !jiraCredentials.apiToken) {
                            setJiraConnectionStatus('Please fill in all fields');
                            return;
                          }

                          setTestingJiraConnection(true);
                          setJiraConnectionStatus(null);

                          try {
                            const response = await fetch('/api/admin/connections/jira/test', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify(jiraCredentials)
                            });

                            const result = await response.json();

                            if (result.success) {
                              setJiraConnectionStatus('✓ Connection successful! Jira API is accessible.');
                            } else {
                              setJiraConnectionStatus(`✗ Connection failed: ${result.message || 'Unknown error'}`);
                            }
                          } catch (error) {
                            setJiraConnectionStatus(`✗ Connection failed: ${error instanceof Error ? error.message : 'Network error'}`);
                          } finally {
                            setTestingJiraConnection(false);
                          }
                        }}
                        disabled={testingJiraConnection}
                        className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {testingJiraConnection ? 'Testing...' : 'Test Connection'}
                      </button>
                      <button
                        onClick={async () => {
                          if (!jiraCredentials.baseUrl || !jiraCredentials.email || !jiraCredentials.apiToken) {
                            setJiraConnectionStatus('Please fill in all fields');
                            return;
                          }

                          try {
                            const response = await fetch('/api/admin/connections/jira', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify(jiraCredentials)
                            });

                            const result = await response.json();

                            if (result.success) {
                              setJiraConnectionStatus('✓ Credentials saved successfully!');
                            } else {
                              setJiraConnectionStatus(`✗ Save failed: ${result.message || 'Unknown error'}`);
                            }
                          } catch (error) {
                            setJiraConnectionStatus(`✗ Save failed: ${error instanceof Error ? error.message : 'Network error'}`);
                          }
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                      >
                        Save Credentials
                      </button>
                    </div>
                  </div>
                </div>

                {/* Tempo Connection */}
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-gray-900">Tempo</h4>
                      <p className="text-sm text-gray-500">Connect to Tempo for time tracking and team management</p>
                    </div>
                    <span className="px-3 py-1 text-sm rounded-full bg-gray-100 text-gray-600">
                      Not Connected
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tempo API Token
                      </label>
                      <input
                        type="password"
                        placeholder="••••••••••••••••"
                        value={tempoCredentials.apiToken}
                        onChange={(e) => setTempoCredentials({ ...tempoCredentials, apiToken: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Generate from: Tempo Settings → Data Access → API Integration → New Token
                      </p>
                    </div>

                    {tempoConnectionStatus && (
                      <div className={`text-sm ${tempoConnectionStatus.startsWith('✓') ? 'text-green-600' : 'text-red-600'}`}>
                        {tempoConnectionStatus}
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={async () => {
                          setTestingTempoConnection(true);
                          setTempoConnectionStatus(null);
                          try {
                            const response = await fetch('/api/admin/connections/tempo/test', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify(tempoCredentials)
                            });
                            const result = await response.json();
                            if (result.success) {
                              setTempoConnectionStatus('✓ Connection successful!');
                            } else {
                              setTempoConnectionStatus(`✗ Connection failed: ${result.error || 'Unknown error'}`);
                            }
                          } catch (error) {
                            setTempoConnectionStatus('✗ Connection failed: Network error');
                          } finally {
                            setTestingTempoConnection(false);
                          }
                        }}
                        disabled={testingTempoConnection || !tempoCredentials.apiToken}
                        className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        {testingTempoConnection ? 'Testing...' : 'Test Connection'}
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            const response = await fetch('/api/admin/connections/tempo', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify(tempoCredentials)
                            });
                            const result = await response.json();
                            if (result.success) {
                              setTempoConnectionStatus('✓ Credentials saved successfully!');
                            } else {
                              setTempoConnectionStatus(`✗ Failed to save: ${result.error || 'Unknown error'}`);
                            }
                          } catch (error) {
                            setTempoConnectionStatus('✗ Failed to save: Network error');
                          }
                        }}
                        disabled={!tempoCredentials.apiToken}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm disabled:bg-blue-400 disabled:cursor-not-allowed"
                      >
                        Save Credentials
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Field Mapping Section */}
            <div className="bg-white rounded-lg shadow mb-6">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Field Mappings</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Configure how fields map between Capacity Planner, Jira, and Tempo.
                      These mappings will automatically sync data once API connections are configured.
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      <strong>Note:</strong> Field paths support dot notation (e.g., "status.name" for nested fields in Jira/Tempo)
                    </p>
                  </div>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
                    + Add Mapping
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Entity Type Selector */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Entity Type
                    </label>
                    <select
                      value={selectedMappingEntity}
                      onChange={(e) => setSelectedMappingEntity(e.target.value)}
                      className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="project">Projects</option>
                      <option value="user">Users/Team Members</option>
                      <option value="team">Tempo Teams</option>
                      <option value="worklog">Worklogs/Time Entries</option>
                      <option value="issue">Issues/Tasks</option>
                    </select>
                  </div>

                  {/* Field Mapping Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-gray-50">
                          <th className="px-4 py-3 text-left font-medium text-gray-700">Capacity Planner Field</th>
                          <th className="px-4 py-3 text-left font-medium text-gray-700">Jira Field</th>
                          <th className="px-4 py-3 text-left font-medium text-gray-700">Tempo Field</th>
                          <th className="px-4 py-3 text-left font-medium text-gray-700">Sync Direction</th>
                          <th className="px-4 py-3 text-left font-medium text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {fieldMappings
                          .filter(mapping => mapping.entity === selectedMappingEntity)
                          .map((mapping, idx) => (
                            <tr key={idx} className="border-b hover:bg-gray-50">
                              <td className="px-4 py-3">
                                <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                                  {mapping.capacityPlannerField}
                                </code>
                              </td>
                              <td className="px-4 py-3">
                                {mapping.jiraField ? (
                                  <input
                                    type="text"
                                    defaultValue={mapping.jiraField}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                    placeholder="Jira field path (e.g., name, status.name)"
                                  />
                                ) : (
                                  <span className="text-xs text-gray-400">N/A</span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                {mapping.tempoField ? (
                                  <input
                                    type="text"
                                    defaultValue={mapping.tempoField}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                    placeholder="Tempo field path"
                                  />
                                ) : (
                                  <span className="text-xs text-gray-400">N/A</span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <select
                                  defaultValue={mapping.bidirectional ? "bidirectional" : "pull"}
                                  className="px-2 py-1 border border-gray-300 rounded text-xs"
                                >
                                  <option value="bidirectional">↔ Bidirectional</option>
                                  <option value="pull">← Pull Only</option>
                                  <option value="push">→ Push Only</option>
                                </select>
                              </td>
                              <td className="px-4 py-3">
                                <button
                                  onClick={() => {
                                    // Remove mapping
                                    setFieldMappings(fieldMappings.filter((_: unknown, i: number) =>
                                      !(fieldMappings[i].entity === mapping.entity &&
                                        fieldMappings[i].capacityPlannerField === mapping.capacityPlannerField)
                                    ));
                                  }}
                                  className="text-red-600 hover:text-red-700 text-xs"
                                >
                                  Remove
                                </button>
                              </td>
                            </tr>
                          ))}
                        {fieldMappings.filter(m => m.entity === selectedMappingEntity).length === 0 && (
                          <tr>
                            <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">
                              No field mappings defined for this entity type. Click "Add Mapping" to create one.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      onClick={() => {
                        // Save mappings to API
                        fetch('/api/admin/mappings', {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify(fieldMappings)
                        })
                          .then(response => {
                            if (!response.ok) {
                              throw new Error(`Save failed: ${response.status}`);
                            }
                            return response.json();
                          })
                          .then(result => {
                            alert(result.message || 'Field mappings saved successfully');
                          })
                          .catch(error => {
                            console.error('Failed to save mappings:', error);
                            alert('Failed to save field mappings. Check console for details.');
                          });
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                    >
                      Save Mappings
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Sync Controls Section */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Synchronization</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Jira Sync */}
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-3">Jira Sync</h4>
                    <div className="space-y-2">
                      <button className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm flex items-center justify-center gap-2">
                        ← Pull from Jira
                      </button>
                      <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm flex items-center justify-center gap-2">
                        → Push to Jira
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-3">
                      Last sync: <span className="font-medium">Never</span>
                    </p>
                  </div>

                  {/* Tempo Sync */}
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-3">Tempo Sync</h4>
                    <div className="space-y-2">
                      <button className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm flex items-center justify-center gap-2">
                        ← Pull from Tempo
                      </button>
                      <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm flex items-center justify-center gap-2">
                        → Push to Tempo
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-3">
                      Last sync: <span className="font-medium">Never</span>
                    </p>
                  </div>
                </div>

                {/* Sync History */}
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-900 mb-3">Sync History</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 text-center">No sync history yet</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Skills Management Section */}
            <div className="bg-white rounded-lg shadow mt-6">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Skills Management</h3>
                    <p className="text-sm text-gray-500 mt-1">Manage skills used across projects, roles, and team members</p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingSkill(null);
                      setSkillFormData('');
                      setShowSkillsManagementModal(true);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                  >
                    + Add Skill
                  </button>
                </div>

                {/* Skills Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {uniqueSkills.map((skill) => {
                    const associations = getSkillAssociations(skill);
                    const totalAssociations = associations.users.length + associations.projects.length + associations.roles.length;

                    return (
                      <div key={skill} className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{skill}</h4>
                          <div className="flex gap-1">
                            <button
                              onClick={() => {
                                setEditingSkill(skill);
                                setSkillFormData(skill);
                                setShowSkillsManagementModal(true);
                              }}
                              className="px-2 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                setSkillToDelete(skill);
                                setShowDeleteSkillModal(true);
                              }}
                              className="px-2 py-1 text-xs rounded bg-red-600 text-white hover:bg-red-700"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        <div className="text-xs text-gray-600 space-y-1">
                          <p>{associations.users.length} user{associations.users.length !== 1 ? 's' : ''}</p>
                          <p>{associations.projects.length} project{associations.projects.length !== 1 ? 's' : ''}</p>
                          <p>{associations.roles.length} role{associations.roles.length !== 1 ? 's' : ''}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {uniqueSkills.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>No skills defined yet. Click "Add Skill" to create one.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Edit Allocation Modal */}
      {editingAllocation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Edit Role Assignment</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={editModalData.startDate}
                  onChange={(e) => setEditModalData({...editModalData, startDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={editModalData.endDate}
                  onChange={(e) => setEditModalData({...editModalData, endDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expected Effort (in hours)</label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={editModalData.expectedHours}
                  onChange={(e) => setEditModalData({...editModalData, expectedHours: Number(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="e.g., 160"
                />
              </div>
              <p className="text-xs text-gray-500">This is a demo. Changes will not be saved.</p>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setEditingAllocation(null)}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('In the full version, this would save the changes.');
                  setEditingAllocation(null);
                }}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Role Modal */}
      {showAddEditRoleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {editingRole ? `Edit Role: ${editingRole.name}` : 'Add New Role'}
            </h3>

            {/* Role Name */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
              <input
                type="text"
                value={roleFormData.name}
                onChange={(e) => setRoleFormData({ ...roleFormData, name: e.target.value })}
                placeholder="e.g., Frontend Developer"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            {/* Role Description */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={roleFormData.description}
                onChange={(e) => setRoleFormData({ ...roleFormData, description: e.target.value })}
                placeholder="Describe what this role does..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            {/* Current Skills */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Required Skills</h4>
              <div className="flex flex-wrap gap-2 mb-3">
                {roleFormData.requiredSkills.length > 0 ? (
                  roleFormData.requiredSkills.map((skill: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded">
                      <span className="text-sm">{skill}</span>
                      <button
                        onClick={() => {
                          setRoleFormData({
                            ...roleFormData,
                            requiredSkills: roleFormData.requiredSkills.filter((_: unknown, i: number) => i !== idx)
                          });
                        }}
                        className="text-blue-600 hover:text-blue-800 font-bold"
                      >
                        ×
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 italic">No skills defined yet</p>
                )}
              </div>

              {/* Add Existing Skill */}
              <div className="mb-4">
                <h5 className="text-xs font-medium text-gray-600 mb-2">Add Existing Skill</h5>
                <div className="grid grid-cols-3 gap-2">
                  {uniqueSkills
                    .filter(skill => !roleFormData.requiredSkills.includes(skill))
                    .map(skill => (
                      <button
                        key={skill}
                        onClick={() => {
                          setRoleFormData({
                            ...roleFormData,
                            requiredSkills: [...roleFormData.requiredSkills, skill]
                          });
                        }}
                        className="text-left p-2 bg-blue-50 rounded hover:bg-blue-100 text-sm"
                      >
                        {skill}
                      </button>
                    ))}
                  {uniqueSkills.filter(skill => !roleFormData.requiredSkills.includes(skill)).length === 0 && (
                    <p className="text-xs text-gray-500 italic col-span-3">All existing skills are already added</p>
                  )}
                </div>
              </div>

              {/* Add New Skill */}
              <div>
                <h5 className="text-xs font-medium text-gray-600 mb-2">Add New Skill</h5>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSkillName}
                    onChange={(e) => setNewSkillName(e.target.value)}
                    placeholder="Enter new skill name..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && newSkillName.trim()) {
                        setRoleFormData({
                          ...roleFormData,
                          requiredSkills: [...roleFormData.requiredSkills, newSkillName.trim()]
                        });
                        setNewSkillName('');
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      if (newSkillName.trim()) {
                        setRoleFormData({
                          ...roleFormData,
                          requiredSkills: [...roleFormData.requiredSkills, newSkillName.trim()]
                        });
                        setNewSkillName('');
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => {
                  setShowAddEditRoleModal(false);
                  setEditingRole(null);
                  setRoleFormData({ name: '', description: '', requiredSkills: [] });
                }}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!roleFormData.name.trim()) {
                    alert('Please enter a role name');
                    return;
                  }

                  if (editingRole) {
                    // Update existing role
                    setRoles(roles.map(r =>
                      r.id === editingRole.id
                        ? {
                            ...r,
                            name: roleFormData.name.trim(),
                            description: roleFormData.description.trim(),
                            requiredSkills: roleFormData.requiredSkills
                          }
                        : r
                    ));
                  } else {
                    // Add new role
                    const newRole = {
                      id: String(Date.now()),
                      name: roleFormData.name.trim(),
                      description: roleFormData.description.trim(),
                      requiredSkills: roleFormData.requiredSkills
                    };
                    setRoles([...roles, newRole]);
                  }

                  setShowAddEditRoleModal(false);
                  setEditingRole(null);
                  setRoleFormData({ name: '', description: '', requiredSkills: [] });
                }}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                {editingRole ? 'Save Changes' : 'Create Role'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Skill Modal */}
      {showSkillsManagementModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">
              {editingSkill ? 'Edit Skill' : 'Add New Skill'}
            </h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Skill Name</label>
              <input
                type="text"
                value={skillFormData}
                onChange={(e) => setSkillFormData(e.target.value)}
                placeholder="e.g., React, Python, AWS"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                autoFocus
              />
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => {
                  setShowSkillsManagementModal(false);
                  setEditingSkill(null);
                  setSkillFormData('');
                }}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const trimmedSkill = skillFormData.trim();
                  if (!trimmedSkill) {
                    alert('Please enter a skill name');
                    return;
                  }

                  if (editingSkill) {
                    // Update skill in all places
                    // Update users
                    DEMO_USERS.forEach(user => {
                      const index = user.skills.indexOf(editingSkill);
                      if (index !== -1) {
                        user.skills[index] = trimmedSkill;
                      }
                    });
                    // Update projects
                    setProjects(projects.map(p => ({
                      ...p,
                      requiredSkills: p.requiredSkills?.map((s: string) => s === editingSkill ? trimmedSkill : s)
                    })));
                    // Update roles
                    setRoles(roles.map(r => ({
                      ...r,
                      requiredSkills: r.requiredSkills.map((s: string) => s === editingSkill ? trimmedSkill : s)
                    })));
                  } else {
                    // Check if skill already exists
                    if (uniqueSkills.includes(trimmedSkill)) {
                      alert('This skill already exists');
                      return;
                    }
                    // For demo, just show success message
                    alert('Skill added successfully. To use it, assign it to users, projects, or roles.');
                  }

                  setShowSkillsManagementModal(false);
                  setEditingSkill(null);
                  setSkillFormData('');
                }}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                {editingSkill ? 'Save Changes' : 'Add Skill'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Skill Confirmation Modal */}
      {showDeleteSkillModal && skillToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <h3 className="text-lg font-semibold mb-4 text-red-600">Confirm Skill Deletion</h3>

            {(() => {
              const associations = getSkillAssociations(skillToDelete);
              const hasAssociations = associations.users.length > 0 || associations.projects.length > 0 || associations.roles.length > 0;

              return (
                <div>
                  <p className="text-sm text-gray-700 mb-4">
                    Are you sure you want to delete "<strong>{skillToDelete}</strong>"?
                  </p>

                  {hasAssociations && (
                    <div className="bg-gray-50 p-4 rounded-lg mb-4 space-y-3">
                      <p className="text-sm font-medium text-gray-900">
                        This will permanently remove all associations:
                      </p>

                      {associations.users.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-gray-700 mb-1">
                            Users ({associations.users.length}):
                          </p>
                          <ul className="text-xs text-gray-600 list-disc list-inside">
                            {associations.users.slice(0, 5).map(user => (
                              <li key={user.id}>{user.name}</li>
                            ))}
                            {associations.users.length > 5 && (
                              <li>...and {associations.users.length - 5} more</li>
                            )}
                          </ul>
                        </div>
                      )}

                      {associations.projects.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-gray-700 mb-1">
                            Projects ({associations.projects.length}):
                          </p>
                          <ul className="text-xs text-gray-600 list-disc list-inside">
                            {associations.projects.slice(0, 5).map(project => (
                              <li key={project.id}>{project.name}</li>
                            ))}
                            {associations.projects.length > 5 && (
                              <li>...and {associations.projects.length - 5} more</li>
                            )}
                          </ul>
                        </div>
                      )}

                      {associations.roles.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-gray-700 mb-1">
                            Roles ({associations.roles.length}):
                          </p>
                          <ul className="text-xs text-gray-600 list-disc list-inside">
                            {associations.roles.slice(0, 5).map(role => (
                              <li key={role.id}>{role.name}</li>
                            ))}
                            {associations.roles.length > 5 && (
                              <li>...and {associations.roles.length - 5} more</li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                    <p className="text-xs text-red-800">
                      <strong>Warning:</strong> This action cannot be undone or reversed. All associations with this skill will be permanently removed from users, projects, and roles. You cannot get them back once deleted.
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setShowDeleteSkillModal(false);
                        setSkillToDelete(null);
                      }}
                      className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        // Remove skill from all users
                        DEMO_USERS.forEach(user => {
                          const index = user.skills.indexOf(skillToDelete);
                          if (index !== -1) {
                            user.skills.splice(index, 1);
                          }
                        });
                        // Remove skill from all projects
                        setProjects(projects.map(p => ({
                          ...p,
                          requiredSkills: p.requiredSkills?.filter((s: string) => s !== skillToDelete)
                        })));
                        // Remove skill from all roles
                        setRoles(roles.map(r => ({
                          ...r,
                          requiredSkills: r.requiredSkills.filter((s: string) => s !== skillToDelete)
                        })));

                        setShowDeleteSkillModal(false);
                        setSkillToDelete(null);
                      }}
                      className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                    >
                      Delete Permanently
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Delete Role Confirmation Modal */}
      {showDeleteRoleModal && roleToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <h3 className="text-lg font-semibold mb-4 text-red-600">Confirm Role Deletion</h3>

            {(() => {
              const associations = getRoleAssociations(roleToDelete.name);

              return (
                <div>
                  <p className="text-sm text-gray-700 mb-4">
                    Are you sure you want to delete the role "<strong>{roleToDelete.name}</strong>"?
                  </p>

                  {associations.allocations.length > 0 && (
                    <div className="bg-gray-50 p-4 rounded-lg mb-4 space-y-3">
                      <p className="text-sm font-medium text-gray-900">
                        This will permanently remove all associations:
                      </p>

                      {associations.projects.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-gray-700 mb-1">
                            Projects ({associations.projects.length}):
                          </p>
                          <ul className="text-xs text-gray-600 list-disc list-inside">
                            {associations.projects.slice(0, 5).map(project => (
                              <li key={project.id}>{project.name}</li>
                            ))}
                            {associations.projects.length > 5 && (
                              <li>...and {associations.projects.length - 5} more</li>
                            )}
                          </ul>
                        </div>
                      )}

                      {associations.users.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-gray-700 mb-1">
                            Users ({associations.users.length}):
                          </p>
                          <ul className="text-xs text-gray-600 list-disc list-inside">
                            {associations.users.slice(0, 5).map(user => (
                              <li key={user.id}>{user.name}</li>
                            ))}
                            {associations.users.length > 5 && (
                              <li>...and {associations.users.length - 5} more</li>
                            )}
                          </ul>
                        </div>
                      )}

                      <p className="text-xs text-gray-600 mt-2">
                        Total allocations to be removed: {associations.allocations.length}
                      </p>
                    </div>
                  )}

                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                    <p className="text-xs text-red-800">
                      <strong>Warning:</strong> This action cannot be undone or reversed. All member assignments and project associations with this role will be permanently removed. You cannot get them back once deleted.
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setShowDeleteRoleModal(false);
                        setRoleToDelete(null);
                      }}
                      className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        setRoles(roles.filter(r => r.id !== roleToDelete.id));
                        setShowDeleteRoleModal(false);
                        setRoleToDelete(null);
                      }}
                      className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                    >
                      Delete Permanently
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Skills Modal */}
      {showSkillsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Add Skills to User</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select User</label>
                <select
                  value={selectedUserForSkills || ''}
                  onChange={(e) => setSelectedUserForSkills(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Choose a user...</option>
                  {DEMO_USERS.map(user => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Skills (comma-separated)</label>
                <input
                  type="text"
                  placeholder="e.g., Python, AWS, Docker"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <p className="text-xs text-gray-500">This is a demo. In the full version, you would be able to add skills to users.</p>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => {
                  setShowSkillsModal(false);
                  setSelectedUserForSkills(null);
                }}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('In the full version, this would add the skills to the selected user.');
                  setShowSkillsModal(false);
                  setSelectedUserForSkills(null);
                }}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Add Skills
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Allocation Modal */}
      {showNewAllocationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Add New Allocation</h3>
            <p className="text-sm text-gray-600 mb-4">This is a demo. In the full version, you would be able to add allocations here.</p>
            <button
              onClick={() => setShowNewAllocationModal(false)}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Edit Project Details Modal */}
      {editingProjectDetails && (() => {
        // Find current project from the correct source (jiraEpics when filtered, otherwise projects)
        const allProjects = projectsFilter.jiraSpace.length > 0 ? jiraEpics : projects;
        const currentProject = allProjects.find(p => p.id === editingProjectDetails);
        const isJiraProject = currentProject?.jiraKey;

        return (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => {
              setEditingProjectDetails(null);
              setSaveSuccess(false);
              setSaveError(null);
            }}
          >
            <div
              className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4">
                Edit Project Details for {currentProject?.name}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={projectDetailsData.description}
                    onChange={(e) => setProjectDetailsData({...projectDetailsData, description: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Brief description of the project..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Owner (IT Owner in Jira)
                  </label>
                  {isJiraProject ? (
                    loadingJiraUsers ? (
                      <div className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-500 text-sm">
                        Loading users...
                      </div>
                    ) : (
                      <>
                        <input
                          type="text"
                          list="jira-users-list"
                          value={projectDetailsData.owner}
                          onChange={(e) => setProjectDetailsData({...projectDetailsData, owner: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          placeholder="Type to search users..."
                        />
                        <datalist id="jira-users-list">
                          {jiraUsers.map((user) => (
                            <option key={user.accountId} value={user.displayName}>
                              {user.emailAddress}
                            </option>
                          ))}
                        </datalist>
                        <p className="mt-1 text-xs text-gray-500">
                          💡 Tip: For multiple owners, separate names with commas (e.g., "John Doe, Jane Smith")
                        </p>
                      </>
                    )
                  ) : (
                    <input
                      type="text"
                      value={projectDetailsData.owner}
                      onChange={(e) => setProjectDetailsData({...projectDetailsData, owner: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Project owner name..."
                    />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Workstream</label>
                  {isJiraProject && loadingFieldMetadata ? (
                    <div className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-500 text-sm">
                      Loading options...
                    </div>
                  ) : isJiraProject ? (
                    <>
                      <select
                        value={projectDetailsData.workstream}
                        onChange={(e) => setProjectDetailsData({...projectDetailsData, workstream: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="">Select workstream...</option>
                        {(fieldMetadata.workstream?.allowedValues || [
                          'Product-Value-Fit',
                          'Funnel Optimization',
                          'Customer Engagement',
                          'Asset Portfolio',
                          'Cost & Productivity',
                          'Channel Expansion',
                          'Fortify the Foundation',
                          'Cybersecurity',
                          'Compliance, and Risk',
                          'Run the Business'
                        ]).map((value: string) => (
                          <option key={value} value={value}>{value}</option>
                        ))}
                      </select>
                      <p className="mt-1 text-xs text-gray-500">
                        {fieldMetadata.workstream?.allowedValues
                          ? 'ℹ️ Allowed values loaded from Jira'
                          : 'ℹ️ Using default workstream values'}
                      </p>
                    </>
                  ) : (
                    <input
                      type="text"
                      value={projectDetailsData.workstream}
                      onChange={(e) => setProjectDetailsData({...projectDetailsData, workstream: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Workstream name..."
                    />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Owner (Business Champion in Jira)
                  </label>
                  {isJiraProject ? (
                    loadingJiraUsers ? (
                      <div className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-500 text-sm">
                        Loading users...
                      </div>
                    ) : (
                      <>
                        <input
                          type="text"
                          list="jira-business-users-list"
                          value={projectDetailsData.businessOwner}
                          onChange={(e) => setProjectDetailsData({...projectDetailsData, businessOwner: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          placeholder="Type to search users..."
                        />
                        <datalist id="jira-business-users-list">
                          {jiraUsers.map((user) => (
                            <option key={user.accountId} value={user.displayName}>
                              {user.emailAddress}
                            </option>
                          ))}
                        </datalist>
                      </>
                    )
                  ) : (
                    <input
                      type="text"
                      value={projectDetailsData.businessOwner}
                      onChange={(e) => setProjectDetailsData({...projectDetailsData, businessOwner: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      placeholder="Business owner name..."
                    />
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    💡 Tip: For multiple business owners, separate names with commas (e.g., "John Doe, Jane Smith")
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">PAR #</label>
                  <input
                    type="text"
                    value={projectDetailsData.par}
                    onChange={(e) => setProjectDetailsData({...projectDetailsData, par: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="PAR number..."
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={projectDetailsData.startDate}
                      onChange={(e) => setProjectDetailsData({...projectDetailsData, startDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="date"
                      value={projectDetailsData.endDate}
                      onChange={(e) => setProjectDetailsData({...projectDetailsData, endDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">In-Service Date</label>
                    <input
                      type="date"
                      value={projectDetailsData.inserviceDate}
                      onChange={(e) => setProjectDetailsData({...projectDetailsData, inserviceDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Business Value</label>
                  <textarea
                    value={projectDetailsData.businessValue}
                    onChange={(e) => setProjectDetailsData({...projectDetailsData, businessValue: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Describe the business value and impact..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Capital/Expense</label>
                    <select
                      value={projectDetailsData.capitalExpense}
                      onChange={(e) => setProjectDetailsData({...projectDetailsData, capitalExpense: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select...</option>
                      <option value="Capital">Capital</option>
                      <option value="Expense">Expense</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Health Status</label>
                    <select
                      value={projectDetailsData.healthStatus}
                      onChange={(e) => setProjectDetailsData({...projectDetailsData, healthStatus: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select...</option>
                      <option value="Green">Green</option>
                      <option value="Yellow">Yellow</option>
                      <option value="Red">Red</option>
                    </select>
                  </div>
                </div>

                {/* Status Transition Section - Only for Jira projects */}
                {isJiraProject && (
                  <div className="border-t pt-4 mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status Transition</label>
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <span className="text-sm text-gray-600">Current Project Phase: </span>
                        <span className="font-semibold">{currentProject?.status}</span>
                      </div>
                      {loadingTransitions ? (
                        <div className="text-sm text-gray-500">Loading transitions...</div>
                      ) : availableTransitions.length > 0 ? (
                        <button
                          onClick={() => setShowTransitionModal(true)}
                          className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700"
                        >
                          Change Status
                        </button>
                      ) : null}
                    </div>
                  </div>
                )}
              </div>

            {/* Error message display */}
            {saveError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-800">Save Failed</p>
                    <p className="text-sm text-red-700 mt-1">{saveError}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => {
                  setEditingProjectDetails(null);
                  setSaveError(null);
                  setSaveSuccess(false);
                }}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setSavingChanges(true);
                  setSaveSuccess(false);
                  setSaveError(null);

                  // Find current project from the correct source
                  const allProjects = projectsFilter.jiraSpace.length > 0 ? jiraEpics : projects;
                  const project = allProjects.find(p => p.id === editingProjectDetails);

                  console.log('Save button clicked');
                  console.log('Project:', project);
                  console.log('Project has jiraKey:', !!project?.jiraKey);

                  // If this is a Jira epic/initiative, update all fields in Jira
                  if (project && project.jiraKey) {
                    try {
                      const updatePayload = {
                        description: projectDetailsData.description,
                        owner: projectDetailsData.owner,
                        businessOwner: projectDetailsData.businessOwner,
                        workstream: projectDetailsData.workstream,
                        par: projectDetailsData.par,
                        startDate: projectDetailsData.startDate,
                        endDate: projectDetailsData.endDate,
                        inserviceDate: projectDetailsData.inserviceDate,
                        businessValue: projectDetailsData.businessValue,
                        capitalExpense: projectDetailsData.capitalExpense,
                        healthStatus: projectDetailsData.healthStatus,
                      };

                      console.log('Updating Jira issue:', project.jiraKey);
                      console.log('Update payload:', updatePayload);

                      const response = await fetch(`/api/admin/epics/${project.jiraKey}/fields`, {
                        method: 'PUT',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(updatePayload),
                      });

                      console.log('Response status:', response.status);
                      const result = await response.json();
                      console.log('Response data:', result);

                      if (!result.success) {
                        const errorMsg = `${result.message || 'Unknown error'} (Status: ${response.status})`;
                        setSaveError(errorMsg);
                        setSavingChanges(false);
                        // Clear error after 5 seconds
                        setTimeout(() => setSaveError(null), 5000);
                        return;
                      }

                      // Show success state
                      setSavingChanges(false);
                      setSaveSuccess(true);
                    } catch (error: any) {
                      console.error('Failed to update Jira fields:', error);
                      const errorMsg = `Failed to update: ${error.message || 'Network error'}`;
                      setSaveError(errorMsg);
                      setSavingChanges(false);
                      // Clear error after 5 seconds
                      setTimeout(() => setSaveError(null), 5000);
                      return;
                    }
                  } else {
                    // Non-Jira project - just update local state
                    setSavingChanges(false);
                    setSaveSuccess(true);
                  }

                  // Update local state in both projects and jiraEpics arrays
                  setProjects(prev => prev.map(p =>
                    p.id === editingProjectDetails
                      ? {
                          ...p,
                          description: projectDetailsData.description,
                          owner: projectDetailsData.owner,
                          workstream: projectDetailsData.workstream,
                          startDate: projectDetailsData.startDate,
                          endDate: projectDetailsData.endDate,
                          inServiceDate: projectDetailsData.inserviceDate,
                          ...(p as any).businessOwner !== undefined && { businessOwner: projectDetailsData.businessOwner },
                          ...(p as any).par !== undefined && { par: projectDetailsData.par },
                          ...(p as any).businessValue !== undefined && { businessValue: projectDetailsData.businessValue },
                          ...(p as any).capitalExpense !== undefined && { capitalExpense: projectDetailsData.capitalExpense },
                          ...(p as any).healthStatus !== undefined && { healthStatus: projectDetailsData.healthStatus }
                        }
                      : p
                  ));

                  // Also update jiraEpics if we're viewing filtered Jira projects
                  setJiraEpics(prev => prev.map(p =>
                    p.id === editingProjectDetails
                      ? {
                          ...p,
                          description: projectDetailsData.description,
                          owner: projectDetailsData.owner,
                          workstream: projectDetailsData.workstream,
                          startDate: projectDetailsData.startDate,
                          endDate: projectDetailsData.endDate,
                          inServiceDate: projectDetailsData.inserviceDate,
                          ...(p as any).businessOwner !== undefined && { businessOwner: projectDetailsData.businessOwner },
                          ...(p as any).par !== undefined && { par: projectDetailsData.par },
                          ...(p as any).businessValue !== undefined && { businessValue: projectDetailsData.businessValue },
                          ...(p as any).capitalExpense !== undefined && { capitalExpense: projectDetailsData.capitalExpense },
                          ...(p as any).healthStatus !== undefined && { healthStatus: projectDetailsData.healthStatus }
                        }
                      : p
                  ));

                  // Auto-close modal after showing success state
                  setTimeout(() => {
                    setEditingProjectDetails(null);
                    setSaveSuccess(false);
                  }, 1000);
                }}
                disabled={savingChanges || saveSuccess || saveError !== null}
                className={`flex-1 px-4 py-2 rounded-md flex items-center justify-center gap-2 ${
                  saveError
                    ? 'bg-red-600 text-white cursor-not-allowed'
                    : saveSuccess
                    ? 'bg-green-600 text-white'
                    : savingChanges
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {savingChanges ? (
                  'Saving...'
                ) : saveError ? (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Failed
                  </>
                ) : saveSuccess ? (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Saved!
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </div>
        </div>
        );
      })()}

      {/* Status Transition Modal */}
      {showTransitionModal && editingProjectDetails && (() => {
        const allProjects = projectsFilter.jiraSpace.length > 0 ? jiraEpics : projects;
        const currentProject = allProjects.find(p => p.id === editingProjectDetails);

        return (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowTransitionModal(false)}
          >
            <div
              className="bg-white rounded-lg p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4">Change Status</h3>
              <p className="text-sm text-gray-600 mb-4">
                Current Project Phase: <span className="font-semibold">{currentProject?.status}</span>
              </p>
              <div className="space-y-2 mb-6">
                {availableTransitions.map((transition) => (
                  <button
                    key={transition.id}
                    onClick={async () => {
                      try {
                        const response = await fetch(`/api/admin/issues/${currentProject?.jiraKey}/transition`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ targetStatus: transition.name }),
                        });

                        const data = await response.json();

                        if (data.success) {
                          // Update local state with new status
                          const updatedProjects = projects.map(p =>
                            p.id === editingProjectDetails
                              ? { ...p, status: transition.to.name }
                              : p
                          );
                          setProjects(updatedProjects);

                          setJiraEpics(prev => prev.map(p =>
                            p.id === editingProjectDetails
                              ? { ...p, status: transition.to.name }
                              : p
                          ));

                          // Close modals after brief delay to show success
                          setTimeout(() => {
                            setShowTransitionModal(false);
                            setEditingProjectDetails(null);
                          }, 500);
                        } else {
                          alert(`Failed to change status: ${data.message}`);
                        }
                      } catch (error) {
                        console.error('Failed to transition issue:', error);
                        alert('Failed to change status. Please try again.');
                      }
                    }}
                    className="w-full px-4 py-2 text-left border border-gray-300 rounded-md hover:bg-gray-50 hover:border-blue-500"
                  >
                    <div className="font-medium">{transition.name}</div>
                    <div className="text-xs text-gray-500">Transition to: {transition.to.name}</div>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowTransitionModal(false)}
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        );
      })()}

      {/* Manage Skills Modal */}
      {showProjectSkillsModal && selectedProjectForSkills && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              Manage Skills for {projects.find(p => p.id === selectedProjectForSkills)?.name}
            </h3>

            {/* Current Skills */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Current Skills</h4>
              <div className="flex flex-wrap gap-2">
                {(() => {
                  const project = projects.find(p => p.id === selectedProjectForSkills);
                  if (!project || !project.requiredSkills || project.requiredSkills.length === 0) {
                    return <p className="text-sm text-gray-500 italic">No skills defined yet</p>;
                  }
                  return project.requiredSkills.map((skill: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-2 px-3 py-1 bg-teal-100 text-teal-700 rounded">
                      <span className="text-sm">{skill}</span>
                      <button
                        onClick={() => {
                          setProjects(prev => prev.map(p =>
                            p.id === selectedProjectForSkills
                              ? { ...p, requiredSkills: p.requiredSkills.filter((_: unknown, i: number) => i !== idx) }
                              : p
                          ));
                        }}
                        className="text-teal-600 hover:text-teal-800 font-bold"
                      >
                        ×
                      </button>
                    </div>
                  ));
                })()}
              </div>
            </div>

            {/* Add Existing Skill */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Add Existing Skill</h4>
              <div className="grid grid-cols-2 gap-2">
                {uniqueSkills
                  .filter(skill => {
                    const project = projects.find(p => p.id === selectedProjectForSkills);
                    return project && (!project.requiredSkills || !project.requiredSkills.includes(skill));
                  })
                  .map(skill => (
                    <button
                      key={skill}
                      onClick={() => {
                        setProjects(prev => prev.map(p =>
                          p.id === selectedProjectForSkills
                            ? { ...p, requiredSkills: [...(p.requiredSkills || []), skill] }
                            : p
                        ));
                      }}
                      className="text-left p-2 bg-blue-50 rounded hover:bg-blue-100 text-sm"
                    >
                      {skill}
                    </button>
                  ))}
                {uniqueSkills.filter(skill => {
                  const project = projects.find(p => p.id === selectedProjectForSkills);
                  return project && (!project.requiredSkills || !project.requiredSkills.includes(skill));
                }).length === 0 && (
                  <p className="text-sm text-gray-500 italic col-span-2">All existing skills are already added</p>
                )}
              </div>
            </div>

            {/* Create New Skill */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Add New Skill</h4>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  placeholder="Enter new skill name..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                <button
                  onClick={() => {
                    if (newSkillName.trim()) {
                      setProjects(prev => prev.map(p =>
                        p.id === selectedProjectForSkills
                          ? { ...p, requiredSkills: [...(p.requiredSkills || []), newSkillName.trim()] }
                          : p
                      ));
                      setNewSkillName('');
                    }
                  }}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-2 pt-4 border-t">
              <button
                onClick={() => {
                  setShowProjectSkillsModal(false);
                  setSelectedProjectForSkills(null);
                  setNewSkillName('');
                }}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {showRoleModal && selectedProjectForRoles && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              Manage Roles for {projects.find(p => p.id === selectedProjectForRoles)?.name}
            </h3>

            {/* Current Roles */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Current Roles</h4>
              <div className="space-y-2">
                {(() => {
                  const project = projects.find(p => p.id === selectedProjectForRoles);
                  if (!project || project.requiredRoles.length === 0) {
                    return <p className="text-sm text-gray-500 italic">No roles defined yet</p>;
                  }
                  return project.requiredRoles.map((role: string, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">{role}</span>
                      <button
                        onClick={() => {
                          alert(`In the full version, this would remove "${role}" from the project.`);
                        }}
                        className="text-xs text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  ));
                })()}
              </div>
            </div>

            {/* Add Existing Role */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Add Existing Role</h4>
              <div className="space-y-2">
                {uniqueRoles
                  .filter(role => {
                    const project = projects.find(p => p.id === selectedProjectForRoles);
                    return project && !project.requiredRoles.includes(role);
                  })
                  .map(role => (
                    <div key={role} className="flex items-center justify-between p-2 bg-blue-50 rounded hover:bg-blue-100 cursor-pointer">
                      <span className="text-sm">{role}</span>
                      <button
                        onClick={() => {
                          alert(`In the full version, this would add "${role}" to the project.`);
                        }}
                        className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                      >
                        Add
                      </button>
                    </div>
                  ))}
                {uniqueRoles.filter(role => {
                  const project = projects.find(p => p.id === selectedProjectForRoles);
                  return project && !project.requiredRoles.includes(role);
                }).length === 0 && (
                  <p className="text-sm text-gray-500 italic">All existing roles are already added</p>
                )}
              </div>
            </div>

            {/* Create New Role */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Create New Role</h4>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  placeholder="Enter new role name..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                <button
                  onClick={() => {
                    if (newRoleName.trim()) {
                      alert(`In the full version, this would create and add the role "${newRoleName}" to the project.`);
                      setNewRoleName('');
                    } else {
                      alert('Please enter a role name.');
                    }
                  }}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm"
                >
                  Create & Add
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Create a new role that doesn't exist in the system yet
              </p>
            </div>

            {/* Footer Buttons */}
            <div className="flex gap-2 pt-4 border-t">
              <button
                onClick={() => {
                  setShowRoleModal(false);
                  setSelectedProjectForRoles(null);
                  setNewRoleName('');
                }}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-500">
            Cap Planner Demo - Enhanced Enterprise Capacity Planning with Jira-Tempo Integration / Brought to life by Team CapAIcity and lots of amazing technical people
          </p>
        </div>
      </footer>
    </div>
  );
}
