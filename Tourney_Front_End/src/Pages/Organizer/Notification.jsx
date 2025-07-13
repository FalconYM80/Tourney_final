
import React, { useState, useRef, useContext, useEffect } from 'react';
import {
  IoMegaphoneOutline,
  IoCalendarOutline,
  IoNotificationsOutline
} from 'react-icons/io5';
import { OrganizerContext } from '../../Contexts/OrganizerContext/OrganizerContext';
import './CSS/CreateTournament.css';
import { toast } from 'react-toastify';


import { useNavigate, useParams } from 'react-router-dom';


// Markdown-like to HTML converter for live preview
const convertToHTML = (text) => {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/~~(.*?)~~/g, '<del>$1</del>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>')
    .replace(/<u>(.*?)<\/u>/g, '<u>$1</u>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
    .replace(/\n/g, '<br>');
};

const notificationSections = [
  {
    id: 'tournament-promotion',
    title: 'TOURNAMENT PROMOTION',
    description: 'Send notification to the players about this tournament. This will help to increase the booking.',
    subDescription: 'We pick all the email address of the players participated in your previous tournaments.',
    icon: <IoMegaphoneOutline size={32} />,
    color: '#f97316',
    bgColor: '#fff7ed'
  },
  {
    id: 'fixtures',
    title: 'FIXTURES',
    description: 'Send notification to the players once fixtures are generated for each events.',
    subDescription: 'Automated notifications will be sent when match schedules are ready.',
    icon: <IoCalendarOutline size={32} />,
    color: '#3b82f6',
    bgColor: '#eff6ff'
  },
  {
    id: 'generic-notification',
    title: 'GENERIC NOTIFICATION',
    description: 'Send notifications like announcement / postpone / cancellation / instructions.',
    subDescription: 'Custom notifications for important tournament updates and communications.',
    icon: <IoNotificationsOutline size={32} />,
    color: '#8b5cf6',
    bgColor: '#f3e8ff'
  }
];

// Rich Text Editor Component with To/Subject fields and Send button
const EmailContentEditor = ({
  value,
  onChange,
  onBack,
  sectionTitle,
  to,
  setTo,
  subject,
  setSubject,
  initialDescription,
  onSend
}) => {
  const textareaRef = useRef(null);

  const { isSubmittingMail, setIsSubmittingMail } = useContext(OrganizerContext);

  useEffect(() => {
    if (initialDescription && value.trim() === '') {
      onChange(initialDescription + '\n\n');
    }
    // eslint-disable-next-line
  }, [initialDescription]);

  const getSelectedText = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      return {
        start,
        end,
        text: textarea.value.substring(start, end)
      };
    }
    return { start: 0, end: 0, text: '' };
  };

  const insertAtCursor = (insertText, replaceSelected = false) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const beforeText = value.substring(0, start);
      const afterText = value.substring(replaceSelected ? end : start);
      const newContent = beforeText + insertText + afterText;
      onChange(newContent);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + insertText.length, start + insertText.length);
      }, 0);
    }
  };

  const wrapSelectedText = (prefix, suffix = '') => {
    const selection = getSelectedText();
    if (selection.text) {
      const wrappedText = prefix + selection.text + (suffix || prefix);
      const beforeText = value.substring(0, selection.start);
      const afterText = value.substring(selection.end);
      onChange(beforeText + wrappedText + afterText);
      setTimeout(() => {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(
          selection.start + prefix.length,
          selection.start + prefix.length + selection.text.length
        );
      }, 0);
    } else {
      insertAtCursor(prefix + 'text' + (suffix || prefix));
    }
  };

  // Toolbar handlers
  const handleBold = () => wrapSelectedText('**');
  const handleItalic = () => wrapSelectedText('*');
  const handleUnderline = () => wrapSelectedText('<u>', '</u>');
  const handleStrikethrough = () => wrapSelectedText('~~');
  const handleQuote = () => insertAtCursor('> ');
  const handleLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      const selection = getSelectedText();
      const linkText = selection.text || 'link text';
      wrapSelectedText(`[${linkText}](${url})`);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSend({ to, subject, content: value });
  };

  return (
    <div className="create-tournament-container-full">
      <div className="create-tournament-header-full">
        <button className="create-tournament-back-btn-full" onClick={onBack}>
          <span className="create-tournament-back-icon-full">&#8592;</span>
          Back
        </button>
        <div className="create-tournament-header-content-full">
          <h2 className="create-tournament-title-full">{sectionTitle}</h2>
        </div>
      </div>
      <div className="create-tournament-card-full">
        <form className="create-tournament-form-full" onSubmit={handleSubmit} autoComplete="off">
          {/* To and Subject Fields */}
          <div className="create-tournament-form-group-full">
            <label className="create-tournament-label-full">
              To <span className="create-tournament-required-full">*</span>
            </label>
            <input
              type="text"
              className="create-tournament-input-full"
              placeholder="Enter recipient email address(es), comma separated"
              value={to}
              onChange={e => setTo(e.target.value)}
              required
              autoComplete="off"
            />
          </div>
          <div className="create-tournament-form-group-full">
            <label className="create-tournament-label-full">
              Subject <span className="create-tournament-required-full">*</span>
            </label>
            <input
              type="text"
              className="create-tournament-input-full"
              placeholder="Enter mail subject"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              required
              autoComplete="off"
            />
          </div>
          {/* Rich Text Editor */}
          <div className="create-tournament-editor-wrapper-full">
            <div className="create-tournament-editor-header-full">
              <label className="create-tournament-editor-label-full">Email Content</label>
              <span className="create-tournament-char-count-full">{value.length} chars</span>
            </div>
            <div className="create-tournament-editor-toolbar-full">
              <button className="create-tournament-toolbar-btn-full" onClick={handleBold} type="button" title="Bold"><b>B</b></button>
              <button className="create-tournament-toolbar-btn-full" onClick={handleItalic} type="button" title="Italic"><i>I</i></button>
              <button className="create-tournament-toolbar-btn-full" onClick={handleUnderline} type="button" title="Underline"><u>U</u></button>
              <button className="create-tournament-toolbar-btn-full" onClick={handleStrikethrough} type="button" title="Strikethrough"><s>S</s></button>
              <div className="create-tournament-toolbar-divider-full"></div>
              <button className="create-tournament-toolbar-btn-full" onClick={handleQuote} type="button" title="Quote">"</button>
              <button className="create-tournament-toolbar-btn-full" onClick={handleLink} type="button" title="Insert Link">🔗</button>
            </div>
            <textarea
              ref={textareaRef}
              value={value}
              onChange={e => onChange(e.target.value)}
              className="create-tournament-editor-textarea-full"
              placeholder="Enter email content"
              rows="10"
              required
            />
            <div className="create-tournament-formatting-help">
              <small>
                <strong>Formatting Help:</strong>
                {' '}**bold** | *italic* | ~~strikethrough~~ | # Heading 1 | ## Heading 2 | {'>'} Quote | [text](url) Link
              </small>
            </div>
            <div className="create-tournament-preview-section-full">
              <div className="create-tournament-preview-card-full">
                <h3 className="create-tournament-preview-title-full">LIVE PREVIEW</h3>
                <div
                  className="create-tournament-preview-content-full"
                  dangerouslySetInnerHTML={{ __html: convertToHTML(value) }}
                />
              </div>
            </div>
          </div>
          <div className="create-tournament-form-actions-full">
            <button
              className="create-tournament-btn-full create-tournament-btn-primary-full"
              type="submit"
              disabled={ isSubmittingMail}
            >
              {isSubmittingMail ? 'Sending...' : 'Send'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Notifications = () => {
  const { tournament, backend_URL, isSubmittingMail, setIsSubmittingMail } = useContext(OrganizerContext);

  // Initial tournament description for promotion section
  const tournamentDescription = tournament?.description || '';

  const navigate = useNavigate();
  const { id } = useParams();

  const [openSection, setOpenSection] = useState(null);

  // State for each section's to, subject, and content
  const [mailFields, setMailFields] = useState({
    'tournament-promotion': { to: '', subject: '', content: '' },
    'fixtures': { to: '', subject: '', content: '' },
    'generic-notification': { to: '', subject: '', content: '' }
  });

  // Handler to update fields for a section
  const updateField = (sectionId, field, value) => {
    setMailFields(prev => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        [field]: value
      }
    }));
  };

  // Send handler: receives { to, subject, content }
  const handleMailSubmit = async ({ to, subject, content }) => {
    // Parse comma separated emails, trim whitespace, filter out empty
    const toAddresses = to
      .split(',')
      .map(addr => addr.trim())
      .filter(addr => !!addr);

    
    if (toAddresses.length === 0) {
      toast.warn('Please enter at least one valid email address.');  
      return;
    }

    if (!subject.trim()) {
      toast.warn('Subject cannot be empty.');
      return;
    }
    if (!content.trim()) {
      toast.warn('Content cannot be empty.');
      return;
    }


    try{
      setIsSubmittingMail(true);
      const fetchOptions = {
        method:"POST",
        credentials:"include",
        headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify({ toAddresses, subject, content })
      }

      const response = await fetch(`${backend_URL}/api/organizer/sendMassMail/${id}`,fetchOptions);
      const data = await response.json();
      if(data.success){
        toast.success(data.message);
        if(data.failedEmails.length>0){
          toast.error(`Failed to send to: ${data.failedEmails.join(', ')}`);
        }
      }else{
        console.log(data);
        toast.error(data.message);
      }
    }catch(error){
        console.log("Error in Front-End Sending Mail Handler ", error);
        toast.error(error);
    }finally{
      setIsSubmittingMail(false);
    }


   
  };

  if (openSection) {
    const section = notificationSections.find(s => s.id === openSection);
    const { to, subject, content } = mailFields[openSection];
    const initialDescription =
      openSection === 'tournament-promotion' && tournamentDescription
        ? tournamentDescription
        : '';

    return (
      <EmailContentEditor
        value={content}
        onChange={val => updateField(openSection, 'content', val)}
        onBack={() => setOpenSection(null)}
        sectionTitle={section.title}
        to={to}
        setTo={val => updateField(openSection, 'to', val)}
        subject={subject}
        setSubject={val => updateField(openSection, 'subject', val)}
        initialDescription={initialDescription}
        onSend={handleMailSubmit}
      />
    );
  }

  return (
    <div className="create-tournament-container-full">
      <h1 className="create-tournament-title-full">Notification Center</h1>
      <p style={{ color: '#6c757d', marginBottom: 32 }}>
        Manage tournament communications and notifications
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 32, maxWidth: 700, margin: '0 auto' }}>
        {notificationSections.map(section => (
          <div
            key={section.id}
            style={{
              background: section.bgColor,
              borderRadius: 16,
              padding: 32,
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
              border: '1px solid #e9ecef',
              transition: 'box-shadow 0.2s',
            }}
            onClick={() => setOpenSection(section.id)}
          >
            <div style={{
              marginRight: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 48,
              height: 48,
              borderRadius: 12,
              background: section.color + '22',
              color: section.color,
              fontSize: 28,
            }}>
              {section.icon}
            </div>
            <div>
              <div className="create-tournament-section-title-full" style={{ marginBottom: 8, color: '#22223b', fontWeight: 700 }}>
                {section.title}
              </div>
              <div style={{ color: '#374151', fontSize: 15, marginBottom: 4 }}>{section.description}</div>
              <div style={{ color: '#6c757d', fontSize: 13 }}>{section.subDescription}</div>
            </div>
            <div style={{ marginLeft: 'auto', color: '#bbb', fontSize: 28 }}>
              &rsaquo;
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notifications;
