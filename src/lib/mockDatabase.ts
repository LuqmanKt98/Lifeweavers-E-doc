
// src/lib/mockDatabase.ts
import type { Client, SessionNote, User, ToDoTask, Attachment, Notification, MessageThread, Message, KnowledgeBaseArticle, Resource } from '@/lib/types';
import { format, addDays, startOfDay, subDays, addHours } from 'date-fns';

// --- Centralized Mock Users ---
// This list includes all potential users, including those for selection in various parts of the app.
export let MOCK_ALL_USERS_DATABASE: User[] = [
  { id: 'user_superadmin', email: 'superadmin@lifeweaver.com', name: 'Dr. Super Admin', role: 'Super Admin', vocation: 'Lead Therapist' },
  { id: 'user_admin', email: 'admin@lifeweaver.com', name: 'Alex Admin', role: 'Admin', vocation: 'Clinic Manager' },
  { id: 'user_clinician', email: 'clinician@lifeweaver.com', name: 'Casey Clinician', role: 'Clinician', vocation: 'Physiotherapist' },
  { id: 'user_clinician2', email: 'clinician2@lifeweaver.com', name: 'Jamie Therapist', role: 'Clinician', vocation: 'Occupational Therapist' },
  { id: 'user_new1', email: 'new.user1@example.com', name: 'Taylor New', role: 'Clinician', vocation: 'Speech Therapist' },
  { id: 'user_new2', email: 'new.user2@example.com', name: 'Morgan Recruit', role: 'Admin' }, // Example of another admin
];

// This subset is often used for selection dropdowns where only clinicians or admins are relevant.
export const getCliniciansAndAdminsForSelection = (): User[] => {
    return MOCK_ALL_USERS_DATABASE.filter(u => u.role === 'Clinician' || u.role === 'Admin');
};
export const getAdminUser = (): User | undefined => MOCK_ALL_USERS_DATABASE.find(u => u.id === 'user_admin');


// --- Centralized Mock Clients ---
export let MOCK_CLIENTS_DB: Record<string, Client> = {
  'client-1': { id: 'client-1', name: 'John Doe', dateAdded: new Date(2023, 0, 15).toISOString(), teamMemberIds: ['user_clinician'] },
  'client-2': { id: 'client-2', name: 'Jane Smith', dateAdded: new Date(2023, 2, 10).toISOString(), teamMemberIds: ['user_clinician2', 'user_clinician'] },
  'client-3': { id: 'client-3', name: 'Alice Johnson', dateAdded: new Date(2022, 11, 1).toISOString(), teamMemberIds: [] },
  'client-4': { id: 'client-4', name: 'Bob Williams', dateAdded: new Date(2023, 5, 20).toISOString(), teamMemberIds: ['user_clinician'] },
  'client-5': { id: 'client-5', name: 'Charlie Brown', dateAdded: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), teamMemberIds: ['user_new1'] },
  'client-6': { id: 'client-6', name: 'Diana Prince', dateAdded: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(), teamMemberIds: ['user_clinician', 'user_clinician2', 'user_new1'] },
};

// --- Centralized Mock Sessions ---
const today = new Date();
export let MOCK_SESSIONS_DB: Record<string, SessionNote[]> = {
  'client-1': [
    { id: 'sess-1-1', clientId: 'client-1', sessionNumber: 1, dateOfSession: new Date(2023, 7, 1).toISOString(), attendingClinicianId: 'user_clinician', attendingClinicianName: 'Casey Clinician', attendingClinicianVocation: 'Physiotherapist', content: '<p>Initial assessment. Patient presents with lower back pain, radiating to the left leg. ROM limited in lumbar flexion and extension.</p><p>Objective: Decrease pain, improve ROM, and educate on self-management.</p>', attachments: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'sess-1-2', clientId: 'client-1', sessionNumber: 2, dateOfSession: new Date(2023, 7, 8).toISOString(), attendingClinicianId: 'user_clinician', attendingClinicianName: 'Casey Clinician', attendingClinicianVocation: 'Physiotherapist', content: '<p>Follow-up session. Introduced light exercises: pelvic tilts, knee-to-chest stretches. Pain reported as 5/10 on VAS, down from 7/10.</p><p>Plan: Continue with current exercises, monitor pain levels.</p>', attachments: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'sess-1-3', clientId: 'client-1', sessionNumber: 3, dateOfSession: new Date(2023,8,10).toISOString(), attendingClinicianId: 'user_clinician', attendingClinicianName: 'Casey Clinician', attendingClinicianVocation: 'Physiotherapist', content: '<p>Patient reported improvement in mobility. Pain 3/10. Able to perform exercises with less discomfort.</p><p>Discussed importance of posture during daily activities. Attached MRI scan for review.</p>', attachments: [
        { id: 'att-1-3-1', name: 'Lumbar_MRI_Scan.pdf', mimeType: 'application/pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', fileType: 'pdf' }
    ], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'sess-1-4', clientId: 'client-1', sessionNumber: 4, dateOfSession: new Date(2023,8,17).toISOString(), attendingClinicianId: 'user_clinician', attendingClinicianName: 'Casey Clinician', attendingClinicianVocation: 'Physiotherapist', content: '<p>Continued with range of motion exercises. Patient progressing well. Lumbar flexion improved by 15 degrees. Pain now 2/10 at rest.</p><p>Introduced core strengthening exercises.</p>', attachments: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { 
      id: 'sess-1-future-1', 
      clientId: 'client-1', 
      sessionNumber: 5, 
      dateOfSession: addDays(startOfDay(today), 3).toISOString(), // 3 days from now
      attendingClinicianId: 'user_clinician', 
      attendingClinicianName: 'Casey Clinician', 
      attendingClinicianVocation: 'Physiotherapist', 
      content: '<p>Upcoming session: Review progress with core strengthening. Discuss return to sport activities.</p>', 
      attachments: [], 
      createdAt: new Date().toISOString(), 
      updatedAt: new Date().toISOString() 
    },
  ],
  'client-2': [
    { id: 'sess-2-1', clientId: 'client-2', sessionNumber: 1, dateOfSession: new Date(2023, 7, 5).toISOString(), attendingClinicianId: 'user_clinician2', attendingClinicianName: 'Jamie Therapist', attendingClinicianVocation: 'Occupational Therapist', content: '<p>First session. Discussed goals: improve daily task management and reduce workplace stress.</p><p>Patient reports feeling overwhelmed with current workload.</p>', attachments: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'sess-2-2', clientId: 'client-2', sessionNumber: 2, dateOfSession: new Date(2023,8,11).toISOString(), attendingClinicianId: 'user_clinician2', attendingClinicianName: 'Jamie Therapist', attendingClinicianVocation: 'Occupational Therapist', content: '<p>Discussed coping strategies for workplace stress. Introduced mindfulness techniques (body scan, mindful breathing).</p><p>Patient receptive and found initial practice calming. Provided resources on mindfulness and workplace ergonomics.</p>', attachments: [
        { id: 'att-2-2-1', name: 'Mindfulness_Guide.pdf', mimeType: 'application/pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', fileType: 'pdf'},
        { id: 'att-2-2-2', name: 'Workplace_Ergonomics.jpg', mimeType: 'image/jpeg', url: 'https://picsum.photos/seed/ergonomics/600/400', previewUrl: 'https://picsum.photos/seed/ergonomics/600/400', fileType: 'image' }
    ], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
     { 
      id: 'sess-2-future-1', 
      clientId: 'client-2', 
      sessionNumber: 3, 
      dateOfSession: addDays(startOfDay(today), 5).toISOString(), // 5 days from now
      attendingClinicianId: 'user_clinician2', 
      attendingClinicianName: 'Jamie Therapist', 
      attendingClinicianVocation: 'Occupational Therapist', 
      content: '<p>Upcoming session: Follow-up on mindfulness practice. Introduce time management techniques for workload.</p>', 
      attachments: [], 
      createdAt: new Date().toISOString(), 
      updatedAt: new Date().toISOString() 
    },
  ],
};

// --- Centralized Mock ToDo Tasks ---
export let MOCK_TODO_TASKS_DB: Record<string, ToDoTask[]> = {
    'client-1': [
        { id: 'todo-1-1', clientId: 'client-1', description: 'Follow up on home exercise plan adherence.', isDone: false, createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), addedByUserId: 'user_clinician', addedByUserName: 'Casey Clinician', assignedToUserIds: ['user_clinician', 'user_admin'], assignedToUserNames: ['Casey Clinician', 'Alex Admin'], dueDate: format(addDays(new Date(), 5), 'yyyy-MM-dd') },
        { id: 'todo-1-2', clientId: 'client-1', description: 'Schedule next appointment.', isDone: true, createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), addedByUserId: 'user_admin', addedByUserName: 'Alex Admin', assignedToUserIds: ['user_admin'], assignedToUserNames: ['Alex Admin'], completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), completedByUserId: 'user_admin', completedByUserName: 'Alex Admin' },
    ],
    'client-6': [
        {
            id: 'todo-6-sys-1', clientId: 'client-6',
            description: 'Conduct 1st Progress Review (30 days post-intake)',
            isDone: true,
            createdAt: MOCK_CLIENTS_DB['client-6']?.dateAdded || new Date().toISOString(),
            addedByUserId: 'system', addedByUserName: 'System',
            assignedToUserIds: ['user_clinician', 'user_admin'],
            assignedToUserNames: ['Casey Clinician', 'Alex Admin'],
            dueDate: MOCK_CLIENTS_DB['client-6'] ? format(addDays(startOfDay(new Date(MOCK_CLIENTS_DB['client-6'].dateAdded)), 30), 'yyyy-MM-dd') : undefined,
            isSystemGenerated: true,
            completedAt: MOCK_CLIENTS_DB['client-6'] ? format(addDays(startOfDay(new Date(MOCK_CLIENTS_DB['client-6'].dateAdded)), 28), 'yyyy-MM-dd') : undefined,
            completedByUserId: 'user_clinician',
            completedByUserName: 'Casey Clinician',
        }
    ]
};

// --- Centralized Mock Notifications ---
export let MOCK_NOTIFICATIONS_DATA: Notification[] = [
  { id: 'notif-1', type: 'admin_broadcast', title: 'System Maintenance Scheduled', content: 'LWV CLINIC E-DOC will be undergoing scheduled maintenance on Sunday at 2 AM for approximately 1 hour.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), read: false },
  { id: 'notif-2', type: 'team_alert', title: 'New Client "Alice Johnson" Assigned', content: 'You have been added to the team for client Alice Johnson. Please review their profile.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), read: true, recipientUserIds: ['user_clinician'], relatedLink: '/clients/client-3' },
  { id: 'notif-3', type: 'system_update', title: 'Session Note Updated', content: 'Casey Clinician updated a session note for John Doe.', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), read: false, recipientUserIds: ['user_admin'], relatedLink: '/clients/client-1' },
  { id: 'notif-4', type: 'admin_broadcast', title: 'Welcome to LWV CLINIC E-DOC!', content: 'We are excited to have you on board. Explore the features and let us know if you have any questions.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), read: true },
  { id: 'notif-5', type: 'team_alert', title: 'Client "Bob Williams" Progress Review', content: 'A progress review meeting for Bob Williams is scheduled for next Tuesday. Please prepare your notes.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), read: false, recipientUserIds: ['user_clinician', 'user_clinician2'], relatedLink: '/clients/client-4' },
];

// --- Centralized Mock Messages ---
export let MOCK_MESSAGE_THREADS_DATA: MessageThread[] = [
  {
    id: 'thread-dm-1', type: 'dm', participantIds: ['user_current_placeholder', 'user_clinician'],
    name: 'Casey Clinician', lastMessageTimestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    lastMessageSnippet: 'Sure, I can help with that report.', unreadCount: 0,
    avatarUrl: 'https://picsum.photos/seed/user_clinician/40/40', avatarFallback: 'CC'
  },
  {
    id: 'thread-team-1', type: 'team_chat', clientTeamId: 'client-1', participantIds: ['user_current_placeholder', 'user_clinician', 'user_admin'],
    name: 'Team John Doe', lastMessageTimestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    lastMessageSnippet: 'Meeting rescheduled to 3 PM.', unreadCount: 2,
    avatarUrl: `https://picsum.photos/seed/client-1/40/40`, avatarFallback: 'JD'
  },
  {
    id: 'thread-dm-2', type: 'dm', participantIds: ['user_current_placeholder', 'user_admin'],
    name: 'Alex Admin', lastMessageTimestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    lastMessageSnippet: 'Okay, sounds good!', unreadCount: 0,
    avatarUrl: 'https://picsum.photos/seed/user_admin/40/40', avatarFallback: 'AA'
  },
  {
    id: 'thread-team-2', type: 'team_chat', clientTeamId: 'client-2', participantIds: ['user_current_placeholder', 'user_clinician2', 'user_clinician'],
    name: 'Team Jane Smith', lastMessageTimestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    lastMessageSnippet: 'Anyone available for a quick sync?', unreadCount: 1,
    avatarUrl: `https://picsum.photos/seed/client-2/40/40`, avatarFallback: 'JS'
  },
];

export let MOCK_MESSAGES_DATA: Record<string, Message[]> = {
  'thread-dm-1': [
    { id: 'msg-dm1-1', threadId: 'thread-dm-1', senderId: 'user_clinician', senderName: 'Casey Clinician', content: 'Hey! Do you have the latest report for Mr. Doe?', timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(), senderAvatarUrl: 'https://picsum.photos/seed/user_clinician/32/32', senderAvatarFallback: 'CC' },
    { id: 'msg-dm1-2', threadId: 'thread-dm-1', senderId: 'user_current_placeholder', senderName: 'Me', content: 'Yes, I do. I\'ll send it over.', timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(), senderAvatarUrl: 'https://picsum.photos/seed/user_current_placeholder/32/32', senderAvatarFallback: 'ME' },
    { id: 'msg-dm1-3', threadId: 'thread-dm-1', senderId: 'user_clinician', senderName: 'Casey Clinician', content: 'Sure, I can help with that report.', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), senderAvatarUrl: 'https://picsum.photos/seed/user_clinician/32/32', senderAvatarFallback: 'CC' },
  ],
  'thread-team-1': [
    { id: 'msg-team1-1', threadId: 'thread-team-1', senderId: 'user_admin', senderName: 'Alex Admin', content: 'Hi team, the client meeting for John Doe has been moved from 2 PM to 3 PM tomorrow.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), senderAvatarUrl: 'https://picsum.photos/seed/user_admin/32/32', senderAvatarFallback: 'AA' },
    { id: 'msg-team1-2', threadId: 'thread-team-1', senderId: 'user_clinician', senderName: 'Casey Clinician', content: 'Meeting rescheduled to 3 PM.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), senderAvatarUrl: 'https://picsum.photos/seed/user_clinician/32/32', senderAvatarFallback: 'CC' },
  ],
  'thread-dm-2': [
    { id: 'msg-dm2-1', threadId: 'thread-dm-2', senderId: 'user_current_placeholder', senderName: 'Me', content: 'Hi Alex, can we discuss the new user onboarding process?', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 25).toISOString(), senderAvatarUrl: 'https://picsum.photos/seed/user_current_placeholder/32/32', senderAvatarFallback: 'ME' },
    { id: 'msg-dm2-2', threadId: 'thread-dm-2', senderId: 'user_admin', senderName: 'Alex Admin', content: 'Okay, sounds good!', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), senderAvatarUrl: 'https://picsum.photos/seed/user_admin/32/32', senderAvatarFallback: 'AA' },
  ],
   'thread-team-2': [
    { id: 'msg-team2-1', threadId: 'thread-team-2', senderId: 'user_clinician2', senderName: 'Jamie Therapist', content: 'Anyone available for a quick sync on Jane Smith\'s progress?', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), senderAvatarUrl: 'https://picsum.photos/seed/user_clinician2/32/32', senderAvatarFallback: 'JT' },
  ],
};


// Mock File Templates for Session Editor attachments
export const MOCK_FILE_TEMPLATES: Omit<Attachment, 'id' | 'url' | 'previewUrl'>[] = [
  { name: "Progress Report Q3.pdf", mimeType: "application/pdf", fileType: "pdf" },
  { name: "Client Intake Form.docx", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", fileType: "document" },
  { name: "Exercise Plan.xlsx", mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileType: "spreadsheet" },
  { name: "Posture Analysis.jpg", mimeType: "image/jpeg", fileType: "image" },
  { name: "Range of Motion.mp4", mimeType: "video/mp4", fileType: "video" },
  { name: "Presentation Summary.pptx", mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation", fileType: "presentation" },
];


// --- Centralized Mock Knowledge Base Articles ---
export let MOCK_KNOWLEDGE_BASE_ARTICLES_DB: KnowledgeBaseArticle[] = [
  {
    id: 'kb-article-1',
    slug: 'understanding-lower-back-pain',
    title: 'Understanding Lower Back Pain: Causes and Initial Management',
    content: '<h2>Common Causes</h2><p>Lower back pain can arise from various factors including muscle strains, ligament sprains, disc herniation, or degenerative conditions like osteoarthritis...</p><h3>Muscle Strains</h3><p>Often caused by sudden movements or overuse...</p><h2>Initial Management</h2><p>Rest, ice, and gentle mobilization exercises are typically recommended...</p><p>For more details, watch this <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" target="_blank" rel="noopener noreferrer">informative video</a>.</p>',
    excerpt: 'An overview of common causes for lower back pain and how to initially manage symptoms.',
    authorId: 'user_superadmin',
    authorName: 'Dr. Super Admin',
    createdAt: subDays(new Date(), 5).toISOString(),
    updatedAt: subDays(new Date(), 2).toISOString(),
    publishedAt: subDays(new Date(), 2).toISOString(),
    isPublished: true,
    tags: ['lower back pain', 'physiotherapy', 'self-management'],
    coverImageUrl: 'https://placehold.co/600x400.png',
    attachments: [
      { id: 'kb-att-1-1', name: 'LBP_Exercises.pdf', mimeType: 'application/pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', fileType: 'pdf' }
    ],
    viewCount: 152,
  },
  {
    id: 'kb-article-2',
    slug: 'ergonomics-for-remote-workers',
    title: 'Ergonomics for Remote Workers: Setting Up Your Home Office',
    content: '<h2>Key Principles</h2><p>Proper chair height, monitor placement, and keyboard/mouse positioning are crucial for preventing musculoskeletal issues...</p><img src="https://placehold.co/400x250.png" alt="Ergonomic Setup" data-ai-hint="ergonomics office" /><h2>Tips for Success</h2><ul><li>Take regular breaks</li><li>Ensure good lighting</li><li>Consider a standing desk</li></ul>',
    excerpt: 'Tips and guidelines for setting up an ergonomic home office to prevent strain and improve productivity.',
    authorId: 'user_admin',
    authorName: 'Alex Admin',
    createdAt: subDays(new Date(), 10).toISOString(),
    updatedAt: subDays(new Date(), 3).toISOString(),
    publishedAt: subDays(new Date(), 3).toISOString(),
    isPublished: true,
    tags: ['ergonomics', 'remote work', 'home office', 'prevention'],
    coverImageUrl: 'https://placehold.co/600x400.png',
    viewCount: 230,
  },
  {
    id: 'kb-article-3',
    slug: 'introduction-to-mindfulness',
    title: 'Introduction to Mindfulness for Stress Reduction',
    content: '<h2>What is Mindfulness?</h2><p>Mindfulness is the practice of paying attention to the present moment without judgment. It can be a powerful tool for managing stress and improving overall well-being.</p>',
    excerpt: 'A beginner\'s guide to understanding mindfulness and its benefits for stress reduction.',
    authorId: 'user_clinician2',
    authorName: 'Jamie Therapist',
    createdAt: subDays(new Date(), 2).toISOString(),
    updatedAt: subDays(new Date(), 1).toISOString(),
    publishedAt: subDays(new Date(), 1).toISOString(),
    isPublished: true,
    tags: ['mindfulness', 'stress reduction', 'mental health'],
    viewCount: 98,
  },
  {
    id: 'kb-article-4',
    slug: 'managing-shoulder-impingement',
    title: 'Managing Shoulder Impingement: Exercises and Advice',
    content: '<h2>Understanding Shoulder Impingement</h2><p>This condition occurs when tendons of the rotator cuff get trapped and compressed during shoulder movements...</p>',
    excerpt: 'Learn about shoulder impingement syndrome and effective exercises for rehabilitation.',
    authorId: 'user_clinician',
    authorName: 'Casey Clinician',
    createdAt: subDays(new Date(), 15).toISOString(),
    updatedAt: subDays(new Date(), 15).toISOString(),
    isPublished: false, // Draft article
    tags: ['shoulder pain', 'rehabilitation', 'exercises'],
  },
    {
    id: 'kb-article-5',
    slug: 'pediatric-speech-therapy-techniques',
    title: 'Effective Techniques in Pediatric Speech Therapy',
    content: '<h2>Play-Based Learning</h2><p>Utilizing games and interactive activities to engage children and promote language development...</p>',
    excerpt: 'Exploring various techniques used in speech therapy for children, focusing on engagement and outcomes.',
    authorId: 'user_new1',
    authorName: 'Taylor New',
    createdAt: subDays(new Date(), 7).toISOString(),
    updatedAt: subDays(new Date(), 4).toISOString(),
    publishedAt: subDays(new Date(), 4).toISOString(),
    isPublished: true,
    tags: ['speech therapy', 'pediatrics', 'child development'],
    coverImageUrl: 'https://placehold.co/600x400.png',
    viewCount: 120,
  },
  {
    id: 'kb-article-6',
    slug: 'latest-advances-in-physiotherapy',
    title: 'Latest Advances in Physiotherapy Technology',
    content: '<h2>Tele-rehabilitation</h2><p>The rise of remote therapy sessions and its benefits...</p><h2>Wearable Technology</h2><p>How wearables are aiding in monitoring and recovery...</p>',
    excerpt: 'A look into new technologies shaping the future of physiotherapy.',
    authorId: 'user_superadmin',
    authorName: 'Dr. Super Admin',
    createdAt: subDays(new Date(), 1).toISOString(),
    updatedAt: subDays(new Date(), 0).toISOString(),
    publishedAt: subDays(new Date(), 0).toISOString(),
    isPublished: true,
    tags: ['physiotherapy', 'technology', 'innovation'],
    viewCount: 75,
  },
];

// --- Centralized Mock Resources ---
export let MOCK_RESOURCES_DB: Resource[] = [
  {
    id: 'res-1',
    slug: 'cognitive-behavioral-therapy-workbook',
    title: 'Cognitive Behavioral Therapy (CBT) Workbook',
    content: '<p>A comprehensive workbook designed to guide users through common CBT exercises. Useful for both clinicians and clients.</p>',
    excerpt: 'A downloadable PDF workbook for CBT exercises.',
    authorId: 'user_superadmin',
    authorName: 'Dr. Super Admin',
    createdAt: subDays(new Date(), 20).toISOString(),
    updatedAt: subDays(new Date(), 5).toISOString(),
    publishedAt: subDays(new Date(), 5).toISOString(),
    isPublished: true,
    tags: ['cbt', 'workbook', 'mental health', 'self-help'],
    coverImageUrl: 'https://placehold.co/600x400.png',
    attachments: [
      { id: 'res-att-1-1', name: 'CBT_Workbook.pdf', mimeType: 'application/pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', fileType: 'pdf' }
    ],
    resourceType: 'document',
    viewCount: 180,
  },
  {
    id: 'res-2',
    slug: 'mindfulness-meditation-guided-audio',
    title: 'Guided Mindfulness Meditation Audio Tracks',
    content: '<p>A collection of guided audio meditations for various durations (5, 10, 20 minutes) to help with stress reduction and focus.</p><p>Access these tracks on our partner site for a calming experience.</p>',
    excerpt: 'Audio tracks for guided mindfulness meditation sessions.',
    authorId: 'user_clinician2',
    authorName: 'Jamie Therapist',
    createdAt: subDays(new Date(), 15).toISOString(),
    updatedAt: subDays(new Date(), 3).toISOString(),
    publishedAt: subDays(new Date(), 3).toISOString(),
    isPublished: true,
    tags: ['mindfulness', 'meditation', 'audio', 'stress relief'],
    externalLink: 'https://www.example.com/mindfulness-audio-tracks', // Example external link
    resourceType: 'website', 
    coverImageUrl: 'https://placehold.co/600x400.png',
    viewCount: 250,
  },
  {
    id: 'res-3',
    slug: 'pain-management-techniques-video-series',
    title: 'Pain Management Techniques Video Series',
    content: '<p>A series of short videos demonstrating various non-pharmacological pain management techniques, including stretching and breathing exercises. Available on our YouTube channel.</p>',
    excerpt: 'Video series demonstrating pain management techniques.',
    authorId: 'user_clinician',
    authorName: 'Casey Clinician',
    createdAt: subDays(new Date(), 8).toISOString(),
    updatedAt: subDays(new Date(), 1).toISOString(),
    publishedAt: subDays(new Date(), 1).toISOString(),
    isPublished: true,
    tags: ['pain management', 'video', 'exercise', 'self-care'],
    coverImageUrl: 'https://placehold.co/600x400.png',
    resourceType: 'video',
    externalLink: 'https://www.youtube.com/playlist?list=PLxxxxxxxxxxxxxx', // Example YouTube playlist
    viewCount: 110,
  },
  {
    id: 'res-4',
    slug: 'nutrition-guidelines-for-recovery',
    title: 'Nutrition Guidelines for Optimal Recovery',
    content: '<p>Evidence-based nutritional advice to support physical recovery and overall well-being. Includes meal planning tips and recipe ideas.</p>',
    excerpt: 'Comprehensive guide on nutrition for recovery, including meal ideas.',
    authorId: 'user_admin',
    authorName: 'Alex Admin',
    createdAt: subDays(new Date(), 30).toISOString(),
    updatedAt: subDays(new Date(), 30).toISOString(),
    isPublished: false, // Draft resource
    tags: ['nutrition', 'recovery', 'health', 'meal plan'],
    resourceType: 'guide',
  },
  {
    id: 'res-5',
    slug: 'recommended-therapy-tools-list',
    title: 'Recommended Therapy Tools and Equipment',
    content: '<p>A curated list of recommended tools for various therapy types, including links to purchase or learn more.</p>',
    excerpt: 'A list of useful tools and equipment for therapists.',
    authorId: 'user_superadmin',
    authorName: 'Dr. Super Admin',
    createdAt: subDays(new Date(), 3).toISOString(),
    updatedAt: subDays(new Date(), 1).toISOString(),
    publishedAt: subDays(new Date(), 1).toISOString(),
    isPublished: true,
    tags: ['tools', 'equipment', 'therapy supplies'],
    resourceType: 'tool',
    attachments: [
       { id: 'res-att-5-1', name: 'Equipment_Catalog_Preview.pdf', mimeType: 'application/pdf', url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', fileType: 'pdf' }
    ],
    viewCount: 95,
  }
];


