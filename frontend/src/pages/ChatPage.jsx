// ...existing code...

const QUICK_TOPICS = [
  { icon: <Wheat size={16}/>, label: 'Crop Advisory', labelHi: 'फसल सलाह', prompt: 'Which crop should I sow this season in my region?' },
  { icon: <Bug size={16}/>, label: 'Pest Control', labelHi: 'कीट नियंत्रण', prompt: 'How to identify and control pests in my crops organically?' },
  { icon: <Droplets size={16}/>, label: 'Irrigation', labelHi: 'सिंचाई', prompt: 'What is the best irrigation method to save water for my farm?' },
  { icon: <Leaf size={16}/>, label: 'Soil Health', labelHi: 'मिट्टी', prompt: 'How to improve my soil health and increase fertility naturally?' },
  { icon: <Landmark size={16}/>, label: 'Govt Schemes', labelHi: 'सरकारी योजना', prompt: 'What government schemes and subsidies am I eligible for as a farmer?' },
  { icon: <BarChart3 size={16}/>, label: 'Market Prices', labelHi: 'बाज़ार', prompt: 'When is the best time to sell my crops to get maximum profit?' },
  { icon: <Sun size={16}/>, label: 'Weather Tips', labelHi: 'मौसम', prompt: 'How should I adjust my farming activities based on current weather?' },
  { icon: <Sprout size={16}/>, label: 'Organic Farming', labelHi: 'जैविक', prompt: 'How to start organic farming and get organic certification in India?' },
];

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिंदी' },
  { code: 'hi-en', label: 'Hinglish' },
  { code: 'mr', label: 'मराठी' },
  { code: 'gu', label: 'ગુજરાતી' },
  { code: 'pa', label: 'ਪੰਜਾਬੀ' },
  { code: 'te', label: 'తెలుగు' },
  { code: 'ta', label: 'தமிழ்' },
];

export default function ChatPage() {
  const { convId } = useParams();
  const navigate = useNavigate();
  const { user, isPro, refreshUser } = useAuth();

  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [currentConvId, setCurrentConvId] = useState(convId || null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState(user?.language || 'hi');

  // Update selectedLang if user.language changes (e.g., after backend update)
  useEffect(() => {
    if (user?.language && user.language !== selectedLang) {
      setSelectedLang(user.language);
    }
  }, [user?.language]);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const synth = useRef(window.speechSynthesis);

  useEffect(() => { fetchConversations(); fetchSuggestions(); }, []);

  useEffect(() => {
    if (convId) { setCurrentConvId(convId); fetchMessages(convId); }
    else { setMessages([]); setCurrentConvId(null); }
  }, [convId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const fetchConversations = async () => {
    try {
      const { data } = await axios.get('/chat/conversations');
      setConversations(data.conversations);
    } catch (e) { console.error(e); }
    finally { setLoadingConvs(false); }
  };

  const fetchMessages = async (cid) => {
    try {
      const { data } = await axios.get(`/chat/conversations/${cid}/messages`);
      setMessages(data.messages);
      setShowSuggestions(data.messages.length === 0);
    } catch (e) {
      toast.error('Failed to load messages');
      navigate('/dashboard');
    }
  };

  const fetchSuggestions = async () => {
    try {
      const { data } = await axios.get('/chat/suggestions');
      setSuggestions(data.suggestions);
    } catch (e) { console.error(e); }
  };

  const sendMessage = useCallback(async (text = input) => {
    if (!text.trim() && !selectedImage) return;
    if (loading) return;

    const userMsg = { id: Date.now(), role: 'user', content: text, image_url: imagePreview };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setSelectedImage(null);
    setImagePreview(null);
    setShowSuggestions(false);
    setLoading(true);

    try {
      const formData = new FormData();
      if (text.trim()) formData.append('message', text.trim());
      if (currentConvId) formData.append('conversationId', currentConvId);
      formData.append('language', selectedLang);
      if (selectedImage) formData.append('image', selectedImage);

      const { data } = await axios.post('/chat/message', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      const aiMsg = { id: data.messageId, role: 'assistant', content: data.message };
      setMessages(prev => [...prev, aiMsg]);


      // Always refresh conversations after sending a message
      fetchConversations();

      if (!currentConvId) {
        setCurrentConvId(data.conversationId);
        navigate(`/dashboard/chat/${data.conversationId}`, { replace: true });
      }

      // Auto-speak if voice enabled
      if (user?.voice_enabled) {
        speak(data.message.replace(/<[^>]+>/g, '').substring(0, 300));
      }

      refreshUser();
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Failed to get response';
      if (err.response?.status === 429 && err.response?.data?.upgradeRequired) {
        toast.error('Daily limit reached! Upgrade to Pro for unlimited messages.', { duration: 5000 });
        navigate('/dashboard/pricing');
      } else {
        toast.error(errMsg);
      }
      setMessages(prev => prev.filter(m => m.id !== userMsg.id));
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }, [input, selectedImage, currentConvId, selectedLang, loading, user]);

  const newChat = () => {
    setMessages([]);
    setCurrentConvId(null);
    setShowSuggestions(true);
    navigate('/dashboard', { replace: true });
  };

  const deleteConversation = async (cid, e) => {
    e.stopPropagation();
    try {
      await axios.delete(`/chat/conversations/${cid}`);
      // Remove only the deleted conversation from the list
      setConversations(prev => prev.filter(c => c.id !== cid));
      // If the deleted conversation is currently open, reset to new chat
      if (currentConvId === cid) {
        newChat();
      } else {
        // Otherwise, just refresh the messages for the current conversation
        if (currentConvId) fetchMessages(currentConvId);
      }
      toast.success('Conversation deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!isPro) { toast.error('Image upload requires Pro plan! 🌾'); navigate('/dashboard/pricing'); return; }
    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const startVoiceRecording = async () => {
    if (!isPro) { toast.error('Voice input requires Pro plan!'); navigate('/dashboard/pricing'); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = e => chunksRef.current.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach(t => t.stop());
        // Use Web Speech API for transcription
        recognizeSpeech();
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);

      // Also start Web Speech API
      recognizeSpeech();
    } catch (err) {
      toast.error('Microphone access denied');
    }
  };

  const recognizeSpeech = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { toast.error('Speech recognition not supported in this browser'); return; }

    const recognition = new SpeechRecognition();
    recognition.lang = selectedLang === 'hi' ? 'hi-IN' : selectedLang === 'mr' ? 'mr-IN' : selectedLang === 'gu' ? 'gu-IN' : selectedLang === 'pa' ? 'pa-IN' : selectedLang === 'te' ? 'te-IN' : selectedLang === 'ta' ? 'ta-IN' : 'en-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setInput(prev => prev + ' ' + transcript);
      setIsRecording(false);
    };
    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);
    recognition.start();
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const speak = (text) => {
    if (!text || !synth.current) return;
    synth.current.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = selectedLang === 'hi' ? 'hi-IN' : 'en-IN';
    utt.rate = 0.9;
    utt.onstart = () => setIsSpeaking(true);
    utt.onend = () => setIsSpeaking(false);
    synth.current.speak(utt);
  };

  const stopSpeaking = () => { synth.current?.cancel(); setIsSpeaking(false); };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const msgCount = user?.messages_today || 0;
  const msgLimit = isPro ? '∞' : 10;

  return (
    <div className="flex h-full overflow-hidden">
      {/* Conversations Sidebar */}
      <div className={`${sidebarOpen ? 'w-72' : 'w-0 lg:w-64'} flex-shrink-0 transition-all duration-300 overflow-hidden border-r border-stone-200 bg-white flex flex-col`}>
        <div className="p-4 border-b border-stone-100">
          <button
            onClick={newChat}
            className="w-full flex items-center justify-center gap-2 bg-forest-600 hover:bg-forest-700 text-white font-semibold py-2.5 px-4 rounded-xl transition-all duration-200 text-sm shadow-sm"
          >
            <Plus size={16} /> New Chat
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider px-2 mb-2">Recent Conversations</p>
          {loadingConvs ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="shimmer h-14 rounded-xl mb-1" />
            ))
          ) : conversations.length === 0 ? (
            <div className="text-center py-8 text-stone-400 text-sm">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
              No conversations yet
            </div>
          ) : (
            conversations.map(conv => (
              <div
                key={conv.id}
                onClick={() => navigate(`/dashboard/chat/${conv.id}`)}
                className={`group flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 ${
                  currentConvId === conv.id ? 'bg-forest-50 border border-forest-200' : 'hover:bg-stone-50'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-800 truncate">{conv.title || 'New conversation'}</p>
                  <p className="text-xs text-stone-400 truncate">{conv.message_count} messages</p>
                </div>
                <button
                  onClick={(e) => deleteConversation(conv.id, e)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-stone-400 hover:text-red-500 rounded-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  disabled={user?.id !== conv.user_id}
                  title={user?.id !== conv.user_id ? 'You can only delete your own conversations' : 'Delete conversation'}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Usage meter */}
        <div className="p-4 border-t border-stone-100">
          {!isPro && (
            <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-amber-700 font-medium">Daily Messages</span>
                <span className="text-amber-600 font-bold">{msgCount}/{msgLimit}</span>
              </div>
              <div className="w-full bg-amber-100 rounded-full h-1.5">
                <div
                  className="bg-amber-500 rounded-full h-1.5 transition-all"
                  style={{ width: `${Math.min(100, (msgCount / 10) * 100)}%` }}
                />
              </div>
              <button
                onClick={() => navigate('/dashboard/pricing')}
                className="mt-2 w-full flex items-center justify-center gap-1 text-xs font-semibold text-amber-700 hover:text-amber-800"
              >
                <Crown size={12}/> Upgrade for unlimited
              </button>
            </div>
          )}
          {isPro && (
            <div className="flex items-center gap-2 bg-forest-50 rounded-xl p-3">
              <Crown size={16} className="text-amber-500" />
              <div>
                <p className="text-xs font-bold text-forest-700">Pro Plan Active</p>
                <p className="text-xs text-forest-500">Unlimited messages</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Chat Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-stone-200 shadow-sm flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-xl text-stone-500 hover:bg-stone-100"
            >
              <ChevronDown size={18} className={`transition-transform ${sidebarOpen ? 'rotate-90' : '-rotate-90'}`} />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-forest-500 to-forest-700 rounded-lg flex items-center justify-center">
                <span className="text-sm">🌾</span>
              </div>
              <div>
                <p className="font-semibold text-forest-800 text-sm leading-tight">AGRIFATHER AI</p>
                <p className="text-xs text-forest-500">Your Agricultural Expert • Always Available</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language selector */}
            <div className="hidden sm:flex items-center gap-1 bg-stone-100 rounded-xl p-1">
              {LANGUAGES.slice(0, 4).map(lang => (
                <button
                  key={lang.code}
                  onClick={async () => {
                    setSelectedLang(lang.code);
                    // If user changes language, update backend and refresh user
                    if (user?.language !== lang.code) {
                      try {
                        await axios.put('/auth/profile', { language: lang.code });
                        refreshUser();
                      } catch {}
                    }
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    selectedLang === lang.code ? 'bg-forest-600 text-white' : 'text-stone-600 hover:text-forest-700'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>

            {isSpeaking && (
              <button onClick={stopSpeaking} className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100">
                <VolumeX size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-5" style={{ background: 'linear-gradient(180deg, #f7fdf9 0%, #fafaf9 100%)' }}>
          {/* Welcome state */}
          {messages.length === 0 && !loading && (
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-forest-100 to-forest-200 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-agri animate-float">
                  <span className="text-4xl">🌾</span>
                </div>
                <h2 className="text-2xl font-display font-bold text-forest-900 mb-2">
                  Namaste! I'm AGRIFATHER
                </h2>
                <p className="text-stone-500 max-w-md mx-auto text-sm leading-relaxed">
                  Your personal AI agriculture expert. Ask me anything about crops, pests, soil, weather, government schemes, and more — in Hindi or English!
                </p>
                <p className="text-forest-600 font-devanagari text-base mt-1">
                  नमस्ते! मैं आपका कृषि सहायक हूं 🌱
                </p>
              </div>

              {/* Quick topics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {QUICK_TOPICS.map((topic, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(topic.prompt)}
                    className="flex flex-col items-center gap-2 p-3 bg-white border border-stone-200 rounded-xl hover:border-forest-300 hover:bg-forest-50 hover:shadow-agri transition-all duration-200 text-center group"
                  >
                    <div className="w-9 h-9 bg-forest-100 rounded-lg flex items-center justify-center text-forest-600 group-hover:bg-forest-200 transition-colors">
                      {topic.icon}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-stone-700">{topic.label}</p>
                      <p className="text-xs text-forest-500 font-devanagari">{topic.labelHi}</p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Suggestions */}
              {suggestions.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">Suggested Questions</p>
                  <div className="space-y-2">
                    {suggestions.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => sendMessage(s)}
                        className="w-full text-left px-4 py-3 bg-white border border-stone-200 rounded-xl text-sm text-stone-700 hover:border-forest-300 hover:bg-forest-50 hover:text-forest-800 transition-all duration-150 font-devanagari"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Messages */}
          <div className="max-w-3xl mx-auto space-y-5 w-full">
            {messages.map((msg, idx) => (
              <div key={msg.id || idx} className={`flex gap-3 message-appear ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-9 h-9 bg-gradient-to-br from-forest-500 to-forest-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5">
                    <span className="text-base">🌾</span>
                  </div>
                )}
                <div className={`max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                  {msg.image_url && (
                    <img src={msg.image_url.startsWith('blob:') ? msg.image_url : msg.image_url} alt="Uploaded" className="max-w-xs rounded-xl border border-stone-200 shadow-sm" />
                  )}
                  <div className={`px-4 py-3 rounded-2xl shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-forest-600 text-white rounded-br-sm'
                      : 'bg-white border border-stone-200 text-stone-800 rounded-bl-sm'
                  }`}>
                    {msg.role === 'assistant' ? (
                      <div
                        className="prose-agri text-base leading-relaxed"
                        style={{ fontSize: '1.15rem' }}
                        dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.content) }}
                      />
                    ) : (
                      <p className="text-base leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    )}
                  </div>
                  {msg.role === 'assistant' && (
                    <button
                      onClick={() => speak(msg.content.replace(/<[^>]+>/g, ''))}
                      className="flex items-center gap-1 text-xs text-stone-400 hover:text-forest-600 transition-colors px-1"
                    >
                      <Volume2 size={12} /> Listen
                    </button>
                  )}
                </div>
                {msg.role === 'user' && (
                  <div className="w-9 h-9 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5 text-white font-bold text-sm">
                    {user?.name?.[0]?.toUpperCase()}
                  </div>
                )}
              </div>
            ))}

            {/* Loading indicator */}
            {loading && (
              <div className="flex gap-3 justify-start message-appear">
                <div className="w-9 h-9 bg-gradient-to-br from-forest-500 to-forest-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                  <span className="text-base">🌾</span>
                </div>
                <div className="bg-white border border-stone-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm flex items-center gap-1">
                  <span className="typing-dot"/>
                  <span className="typing-dot"/>
                  <span className="typing-dot"/>
                  <span className="text-xs text-stone-400 ml-2">AGRIFATHER is thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Image preview */}
        {imagePreview && (
          <div className="px-4 py-2 bg-white border-t border-stone-200 flex items-center gap-3">
            <div className="relative">
              <img src={imagePreview} alt="Preview" className="w-16 h-16 rounded-xl object-cover border border-stone-200" />
              <button
                onClick={() => { setSelectedImage(null); setImagePreview(null); }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
              >
                <X size={10} />
              </button>
            </div>
            <p className="text-xs text-stone-500">Image ready to send with your message</p>
          </div>
        )}

        {/* Input area */}
        <div className="px-4 py-4 bg-white border-t border-stone-200 flex-shrink-0">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-end gap-2 bg-stone-50 border border-stone-200 rounded-2xl px-4 py-2 focus-within:border-forest-400 focus-within:shadow-agri transition-all duration-200">
              {/* Image upload */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`p-2 rounded-xl transition-colors flex-shrink-0 mb-0.5 ${
                  isPro ? 'text-stone-400 hover:text-forest-600 hover:bg-forest-50' : 'text-stone-300 cursor-not-allowed'
                }`}
                title={isPro ? 'Upload crop image for disease detection' : 'Image upload requires Pro plan'}
              >
                <ImagePlus size={20} />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />

              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about crops, pests, soil, weather... / फसल, कीट, मिट्टी के बारे में पूछें..."
                className="flex-1 bg-transparent text-stone-800 placeholder-stone-400 text-sm resize-none outline-none py-2 max-h-32 font-devanagari"
                rows={1}
                style={{ minHeight: '40px' }}
              />

              {/* Voice button */}
              <button
                onMouseDown={startVoiceRecording}
                onMouseUp={stopRecording}
                onTouchStart={startVoiceRecording}
                onTouchEnd={stopRecording}
                className={`p-2 rounded-xl transition-all flex-shrink-0 mb-0.5 ${
                  isRecording ? 'voice-recording bg-red-500 text-white' :
                  isPro ? 'text-stone-400 hover:text-forest-600 hover:bg-forest-50' : 'text-stone-300 cursor-not-allowed'
                }`}
                title={isPro ? 'Hold to record voice (Hindi/English)' : 'Voice requires Pro plan'}
              >
                {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
              </button>

              {/* Send button */}
              <button
                onClick={() => sendMessage()}
                disabled={loading || (!input.trim() && !selectedImage)}
                className="p-2 rounded-xl bg-forest-600 hover:bg-forest-700 text-white transition-all duration-200 flex-shrink-0 mb-0.5 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm active:scale-95"
              >
                {loading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
              </button>
            </div>

            <p className="text-center text-xs text-stone-400 mt-2">
              AGRIFATHER provides agricultural guidance. For emergencies, contact KVK: 1551 | PM-Kisan: 155261
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
