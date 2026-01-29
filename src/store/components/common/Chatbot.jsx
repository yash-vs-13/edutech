import React, { useState, useEffect, useRef, memo, useCallback } from 'react';
import { useSelector } from 'react-redux';
import Button from './Button';

const Chatbot = memo(() => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, text: "Hi there! I'm Edward, your personal learning assistant. How can I help you today?", sender: 'edward' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [hasUnread, setHasUnread] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const messagesEndRef = useRef(null);

    const { courses } = useSelector((state) => state.courses);
    const { user } = useSelector((state) => state.auth);
    const enrollments = useSelector((state) => state.enrollments?.enrollments || []);

    // Get last read message ID from localStorage
    const getLastReadMessageId = () => {
        if (!user) return null;
        const stored = localStorage.getItem(`chatbot_last_read_${user.id}`);
        return stored ? parseInt(stored, 10) : null;
    };

    // Save last read message ID to localStorage
    const saveLastReadMessageId = (messageId) => {
        if (!user) return;
        localStorage.setItem(`chatbot_last_read_${user.id}`, messageId.toString());
    };

    // Check if there are unread messages
    const checkUnreadMessages = useCallback(() => {
        if (!user || messages.length === 0) {
            setHasUnread(false);
            return;
        }
        const lastMessageId = messages[messages.length - 1]?.id;
        const lastReadId = getLastReadMessageId();
        
        // If no last read ID exists, consider the initial message as read
        if (lastReadId === null) {
            // Mark initial message as read
            saveLastReadMessageId(messages[0]?.id || 1);
            setHasUnread(false);
            return;
        }
        
        // Show red dot only if last message ID is greater than last read ID
        setHasUnread(lastMessageId > lastReadId);
    }, [user, messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Check for unread messages when messages change
    useEffect(() => {
        checkUnreadMessages();
    }, [checkUnreadMessages]);

    // Initialize last read message ID on mount
    useEffect(() => {
        if (user && messages.length > 0) {
            const lastReadId = getLastReadMessageId();
            // If no last read ID exists, mark the initial message as read
            if (lastReadId === null) {
                saveLastReadMessageId(messages[0]?.id || 1);
            }
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            // Check if chatbot has been shown in this login session
            const chatbotShown = sessionStorage.getItem(`chatbot_shown_${user.id}`);
            
            if (!chatbotShown) {
                const timer = setTimeout(() => {
                    setShowPreview(true);
                    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2357/2357-preview.mp3');
                    audio.volume = 0.3;
                    audio.play().catch(e => console.log('Audio auto-play blocked by browser.', e));

                    // Mark as shown for this login session
                    sessionStorage.setItem(`chatbot_shown_${user.id}`, 'true');

                    // Auto hide preview after 8 seconds
                    setTimeout(() => setShowPreview(false), 8000);
                }, 1000);
                return () => clearTimeout(timer);
            }
        }
    }, [user]);

    const getEdResponse = (query) => {
        const q = query.toLowerCase();

        // 1. HELP / CAPABILITIES
        if (q.includes('help') || q.includes('what can you do') || q.includes('how to use')) {
            return "I am Edward, your learning assistant! I can help you with:\n\n" +
                "• Finding courses ('list all courses')\n" +
                "• Course categories ('show categories')\n" +
                "• Difficulty levels ('what levels?')\n" +
                "• Your progress ('show my courses')\n" +
                "• Getting a summary ('give me complete details')";
        }

        // 2. COURSE LEVELS
        if (q.includes('level') || q.includes('difficulty') || q.includes('hard') || q.includes('easy') || q.includes('beginner')) {
            if (!courses || !Array.isArray(courses) || courses.length === 0) {
                return "Our courses are designed for all levels, primarily ranging from Beginner to Advanced!";
            }
            const levels = new Set();
            courses.forEach(c => {
                const level = c.difficulty || c.level;
                if (level) levels.add(level.charAt(0).toUpperCase() + level.slice(1));
            });
            return levels.size > 0
                ? `We offer courses at these difficulty levels: ${Array.from(levels).join(', ')}.`
                : "Our courses are designed for all levels, primarily ranging from Beginner to Advanced!";
        }

        // 3. CATEGORIES
        if (q.includes('category') || q.includes('categories') || q.includes('subject') || q.includes('topic') || q.includes('type')) {
            if (!courses || !Array.isArray(courses) || courses.length === 0) {
                return "We have a wide variety of topics! Check the 'All Courses' page for the full list.";
            }
            const categories = new Set();
            courses.forEach(c => {
                if (c.category) categories.add(c.category);
            });
            return categories.size > 0
                ? `You can choose from these categories: ${Array.from(categories).join(', ')}.`
                : "We have a wide variety of topics! Check the 'All Courses' page for the full list.";
        }

        // 4. ALL COURSES / SEARCH
        if (q.includes('all course') || q.includes('list') || q.includes('show courses') || q.includes('available')) {
            if (!courses || !Array.isArray(courses) || courses.length === 0) {
                return "We're currently updating our catalog. Please check back soon!";
            }

            // Check if user is searching for a specific course
            const searchTerms = q.split(' ').filter(word => word.length > 3);
            const foundCourse = courses.find(c => searchTerms.some(term => c.title.toLowerCase().includes(term)));

            if (foundCourse && !q.includes('all')) {
                const title = foundCourse.title.length > 30 ? foundCourse.title.substring(0, 30) + '...' : foundCourse.title;
                return `I found a course called "${title}". It's in the ${foundCourse.category} category. Would you like to see more?`;
            }

            const courseList = courses.map(c => {
                const title = c.title.length > 30 ? c.title.substring(0, 30) + '...' : c.title;
                return `• ${title}`;
            }).slice(0, 5).join('\n');
            return `We have ${courses.length} courses. Here are some of them:\n${courseList}${courses.length > 5 ? '\n...and more!' : ''}`;
        }

        // 5. MY COURSES / ENROLLMENTS
        if (q.includes('my course') || q.includes('my learning') || q.includes('enrolled') || q.includes('progress') || q.includes('i am taking')) {
            if (!user) return "Please log in to your account to view your enrolled courses.";

            const userEnrollments = enrollments.filter(e => e.userId === user.id);
            if (userEnrollments.length === 0) return "You aren't enrolled in any courses yet. Explore our catalog to find something you like!";

            if (!courses || !Array.isArray(courses) || courses.length === 0) {
                return "We're currently updating our catalog. Please check back soon!";
            }

            const enrolledCourseIds = userEnrollments.map(e => e.courseId);
            const enrolledCourseTitles = courses
                .filter(c => enrolledCourseIds.includes(c.id))
                .map(c => {
                    const title = c.title.length > 30 ? c.title.substring(0, 30) + '...' : c.title;
                    return `• ${title}`;
                });

            return `You are currently enrolled in ${userEnrollments.length} course(s):\n${enrolledCourseTitles.join('\n')}\nKeep up the great progress!`;
        }

        // 6. AD-HOC COMPLETE DETAILS
        if (q.includes('detail') || q.includes('everything') || q.includes('summary') || q.includes('status')) {
            if (!courses || !Array.isArray(courses)) {
                return `*** System Summary ***\n\n📚 **Total Courses**: 0\n🏷️ **Categories**: General\n📊 **Levels**: All skill levels\n✅ **Your Enrollments**: ${user ? enrollments.filter(e => e.userId === user.id).length : 'Login to see'}`;
            }
            const categories = Array.from(new Set(courses.map(c => c.category).filter(Boolean)));
            const levels = Array.from(new Set(courses.map(c => c.difficulty || c.level).filter(Boolean)));
            const myCount = user ? enrollments.filter(e => e.userId === user.id).length : 0;

            return `*** System Summary ***\n\n` +
                `📚 **Total Courses**: ${courses.length}\n` +
                `🏷️ **Categories**: ${categories.length > 0 ? categories.join(', ') : 'General'}\n` +
                `📊 **Levels**: ${levels.length > 0 ? levels.join(', ') : 'All skill levels'}\n` +
                `✅ **Your Enrollments**: ${user ? myCount : 'Login to see'}`;
        }

        // 7. GREETINGS
        if (q.includes('hi') || q.includes('hello') || q.includes('hey') || q.includes('edward')) {
            return `Hello${user ? ' ' + user.name : ''}! I'm Edward. How can I assist with your learning journey today?`;
        }

        // 8. IDENTITY
        if (q.includes('who are you') || q.includes('your name')) {
            return "I'm Edward, your interactive learning assistant! I was built to help you navigate your courses and find new ones.";
        }

        return "I'm not exactly sure about that. Try asking about 'categories', 'levels', 'my courses', or ask for a 'summary'.";
    };

    const handleSendMessage = (e) => {
        e?.preventDefault();
        if (!inputValue.trim()) return;

        const userMessage = { id: Date.now(), text: inputValue, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');

        // Simulate thinking
        setTimeout(() => {
            const responseText = getEdResponse(userMessage.text);
            const edMessage = { id: Date.now() + 1, text: responseText, sender: 'edward' };
            setMessages(prev => {
                const newMessages = [...prev, edMessage];
                // If chat is open, mark the new message as read immediately (user can see it)
                if (isOpen) {
                    saveLastReadMessageId(edMessage.id);
                    setHasUnread(false);
                } else {
                    // If chat is closed, don't mark as read - let checkUnreadMessages handle the red dot
                    // Show preview popup
                    setShowPreview(true);
                    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2357/2357-preview.mp3');
                    audio.volume = 0.2;
                    audio.play().catch(() => { });
                    setTimeout(() => setShowPreview(false), 8000);
                    // checkUnreadMessages will be called automatically via useEffect when messages change
                }
                return newMessages;
            });
        }, 600);
    };

    const quickActions = [
        "My Courses",
        "All Courses",
        "Categories",
        "Course Levels"
    ];

    const handleQuickAction = (action) => {
        setInputValue(action);
        // Explicitly call handleSendMessage logic since state won't update in time for a manual call
        const userMessage = { id: Date.now(), text: action, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setTimeout(() => {
            const responseText = getEdResponse(action);
            const edMessage = { id: Date.now() + 1, text: responseText, sender: 'edward' };
            setMessages(prev => {
                const newMessages = [...prev, edMessage];
                // If chat is open, mark the new message as read immediately (user can see it)
                if (isOpen) {
                    saveLastReadMessageId(edMessage.id);
                    setHasUnread(false);
                } else {
                    // If chat is closed, don't mark as read - let checkUnreadMessages handle the red dot
                    // Show preview popup
                    setShowPreview(true);
                    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2357/2357-preview.mp3');
                    audio.volume = 0.2;
                    audio.play().catch(() => { });
                    setTimeout(() => setShowPreview(false), 8000);
                    // checkUnreadMessages will be called automatically via useEffect when messages change
                }
                return newMessages;
            });
        }, 600);
    };

    return (
        <div className="fixed bottom-6 right-6 z-[10000] transition-all duration-300 ease-in-out">
            {/* Chat Window */}
            {isOpen && (
                <div className="absolute bottom-20 right-0 w-[85vw] sm:w-[340px] md:w-[360px] lg:w-[380px] max-w-sm h-[400px] md:h-[460px] max-h-[70vh] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
                    {/* Header */}
                    <div className="bg-primary-600 p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white ring-2 ring-white/30 truncate">
                                <span className="font-bold text-[10px]">Edward</span>
                            </div>
                            <div>
                                <h3 className="text-white font-semibold">Edward Assistant</h3>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                                    <span className="text-primary-100 text-xs text-opacity-80">Always Online</span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-white hover:bg-white/10 p-1 rounded-lg transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 scrollbar-thin scrollbar-thumb-gray-200">
                        {messages.map((m) => (
                            <div
                                key={m.id}
                                className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[85%] p-3 rounded-2xl shadow-sm text-sm ${m.sender === 'user'
                                        ? 'bg-primary-600 text-white rounded-tr-none'
                                        : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                                        }`}
                                >
                                    <p className="whitespace-pre-wrap leading-relaxed">{m.text}</p>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Actions */}
                    <div className="px-4 py-2 bg-white flex flex-wrap gap-2 border-t border-gray-50">
                        {quickActions.map(action => (
                            <button
                                key={action}
                                onClick={() => handleQuickAction(action)}
                                className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-primary-50 hover:text-primary-600 rounded-full transition-all border border-gray-200 text-gray-600 font-medium"
                            >
                                {action}
                            </button>
                        ))}
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-100">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="Ask Edward something..."
                                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
                            />
                            <Button
                                type="submit"
                                variant="primary"
                                size="sm"
                                className="!rounded-xl px-4"
                                disabled={!inputValue.trim()}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            {/* Preview Bubble */}
            {showPreview && !isOpen && (
                <div
                    onClick={() => {
                        setIsOpen(true);
                        // Mark all messages as read when opening chat
                        if (messages.length > 0) {
                            const lastMessageId = messages[messages.length - 1]?.id;
                            saveLastReadMessageId(lastMessageId);
                            setHasUnread(false);
                        }
                        setShowPreview(false);
                    }}
                    className="absolute bottom-20 right-0 w-64 bg-white p-4 rounded-2xl shadow-xl border border-gray-100 cursor-pointer animate-in fade-in slide-in-from-bottom-2 duration-300 group"
                >
                    <div className="flex justify-between items-start mb-1">
                        <span className="text-[10px] font-bold text-primary-600 uppercase tracking-wider">Edward</span>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowPreview(false);
                            }}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-3 leading-relaxed">
                        {messages[messages.length - 1]?.text}
                    </p>
                    <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white border-r border-b border-gray-100 rotate-45"></div>
                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={() => {
                    const willOpen = !isOpen;
                    setIsOpen(willOpen);
                    if (willOpen) {
                        // Mark all messages as read when opening chat
                        if (messages.length > 0) {
                            const lastMessageId = messages[messages.length - 1]?.id;
                            saveLastReadMessageId(lastMessageId);
                            setHasUnread(false);
                        }
                        setShowPreview(false);
                    } else {
                        // When closing chat, mark all current messages as read
                        if (messages.length > 0) {
                            const lastMessageId = messages[messages.length - 1]?.id;
                            saveLastReadMessageId(lastMessageId);
                            setHasUnread(false);
                        }
                    }
                }}
                className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 transform hover:scale-110 active:scale-95 ${isOpen ? 'bg-red-500 rotate-90' : 'bg-primary-600'
                    }`}
            >
                {isOpen ? (
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <div className="relative">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                            />
                        </svg>
                        {hasUnread && (
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-primary-600 animate-pulse"></span>
                        )}
                    </div>
                )}
            </button>
        </div>
    );
});

Chatbot.displayName = 'Chatbot';

export default Chatbot;
