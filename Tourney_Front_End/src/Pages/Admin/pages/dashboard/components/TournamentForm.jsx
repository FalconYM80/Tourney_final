import React, { useState, useRef, useEffect } from 'react';
import './CSS/CreateTournament.css';
import { IoChevronBack, IoCalendarOutline, IoLocationOutline, IoCloudUploadOutline, IoAdd } from 'react-icons/io5';

import { useNavigate } from 'react-router-dom';


import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';


import { toast } from 'react-toastify';


import { OrganizerContext } from '../../../../../Contexts/OrganizerContext/OrganizerContext';
import { useContext } from 'react';





// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});



const TournamentForm = () => {


  const { isOrganizerLoggedIn } = useContext(OrganizerContext);

  const navigate = useNavigate();

    // useEffect(()=>{
    //   if (!isOrganizerLoggedIn) {
    //     navigate('/');
    //   }
    //  },[isOrganizerLoggedIn]);



  const [currentStep, setCurrentStep] = useState('basic');
  const [formData, setFormData] = useState({
    tournamentName: '',
    tournamentType: 'Public',
    sport: '',
    startDate: '',
    endDate: '',
    location: '',
    coverImage: null,
    description: '',
    selectedPlace: null,
    coordinates: null
  });

  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const sports = [
    'Badminton', 'Cricket', 'Football', 'Tennis', 'Basketball', 
    'Volleyball', 'Table Tennis', 'Chess', 'Kabaddi', 'Hockey'
  ];

  // Free location search using Nominatim (OpenStreetMap)
  const searchLocation = async (query) => {
    if (query.length < 3) {
      setLocationSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&countrycodes=in&q=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      
      const suggestions = data.map(item => ({
        display_name: item.display_name,
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
        place_id: item.place_id
      }));
      
      setLocationSuggestions(suggestions);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error searching location:', error);
      setLocationSuggestions([]);
    }
    setIsSearching(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Search for locations when typing in location field
    if (name === 'location') {
      searchLocation(value);
      
      if (value === '') {
        setFormData(prev => ({
          ...prev,
          selectedPlace: null,
          coordinates: null
        }));
      }
    }
  };

  const handleLocationSelect = (suggestion) => {
    setFormData(prev => ({
      ...prev,
      location: suggestion.display_name,
      selectedPlace: suggestion,
      coordinates: [suggestion.lat, suggestion.lon]
    }));
    setShowSuggestions(false);
    setLocationSuggestions([]);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        coverImage: file
      }));
    }
  };


  
  const handlePoster = (evt)=>{

    const image = evt.target.files[0];

    if(!image){
      return;
    }

    const reader = new FileReader();

    reader.readAsDataURL(image);

    reader.onload = async ()=>{
      const base64Image = reader.result;
      // setEditDetails((prev)=>{
      //   return {...prev, profilePic: base64Image};
      // })
      setFormData(prev => ({
        ...prev,
        coverImage: base64Image
      }));
    }


  }

 




  const handleNextStep = () => {
    if(!formData.tournamentName || !formData.tournamentType || !formData.sport || !formData.startDate || !formData.endDate || !formData.location || !formData.coverImage){
      toast.warn("All Fields are mandatory to fill");
      return;
    }
    setCurrentStep('details');
  };

  const handleBackToBasic = () => {
    setCurrentStep('basic');
  };

  const handleSave = () => {
    console.log('Tournament saved:', formData);
  };

  if (currentStep === 'details') {
    return <TournamentDetails 
      formData={formData} 
      setFormData={setFormData}
      onBack={handleBackToBasic}
    />;
  }

  return (
    <div className="create-tournament-layout-full">
      <div className="create-tournament-container-full">
        {/* Header */}
        <div className="create-tournament-header-full">
          <button className="create-tournament-back-btn-full" onClick={()=>{navigate('/organizer/home')}}>
            <IoChevronBack className="create-tournament-back-icon-full" />
          </button>
          <div className="create-tournament-header-content-full">
            <h1 className="create-tournament-title-full">Create New Tournament</h1>
            <p className="create-tournament-subtitle-full">Set up your tournament details and configuration</p>
          </div>
        </div>

        {/* Form Card */}
        <div className="create-tournament-card-full">
          <div className="create-tournament-card-header-full">
            <h2 className="create-tournament-section-title-full">Basic Information</h2>
          </div>

          <form className="create-tournament-form-full">
            {/* Tournament Name */}
            <div className="create-tournament-form-group-full">
              <label className="create-tournament-label-full">
                Tournament Name <span className="create-tournament-required-full">*</span>
              </label>
              <input
                type="text"
                name="tournamentName"
                value={formData.tournamentName}
                onChange={handleInputChange}
                placeholder="Enter tournament name"
                className="create-tournament-input-full"
              />
            </div>

            {/* Tournament Type */}
            <div className="create-tournament-form-group-full">
              <label className="create-tournament-label-full">
                Tournament Type <span className="create-tournament-required-full">*</span>
              </label>
              <div className="create-tournament-radio-group-full">
                <label className="create-tournament-radio-option-full">
                  <input
                    type="radio"
                    name="tournamentType"
                    value="Public"
                    checked={formData.tournamentType === 'Public'}
                    onChange={handleInputChange}
                    className="create-tournament-radio-full"
                  />
                  <span className="create-tournament-radio-label-full">Public</span>
                </label>
                <label className="create-tournament-radio-option-full">
                  <input
                    type="radio"
                    name="tournamentType"
                    value="Private"
                    checked={formData.tournamentType === 'Private'}
                    onChange={handleInputChange}
                    className="create-tournament-radio-full"
                  />
                  <span className="create-tournament-radio-label-full">Private</span>
                </label>
              </div>
            </div>

            {/* Sport */}
            <div className="create-tournament-form-group-full">
              <label className="create-tournament-label-full">
                Sport <span className="create-tournament-required-full">*</span>
              </label>
              <select
                name="sport"
                value={formData.sport}
                onChange={handleInputChange}
                className="create-tournament-select-full"
              >
                <option value="">Select sport</option>
                {sports.map(sport => (
                  <option key={sport} value={sport}>{sport}</option>
                ))}
              </select>
            </div>

            {/* Date Range */}
            <div className="create-tournament-date-row-full">
              <div className="create-tournament-form-group-full">
                <label className="create-tournament-label-full">
                  Start Date <span className="create-tournament-required-full">*</span>
                </label>
                <div className="create-tournament-date-input-wrapper-full">
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="create-tournament-input-full create-tournament-date-input-full"
                  />
                  <IoCalendarOutline className="create-tournament-date-icon-full" />
                </div>
              </div>
              <div className="create-tournament-form-group-full">
                <label className="create-tournament-label-full">
                  End Date <span className="create-tournament-required-full">*</span>
                </label>
                <div className="create-tournament-date-input-wrapper-full">
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="create-tournament-input-full create-tournament-date-input-full"
                  />
                  <IoCalendarOutline className="create-tournament-date-icon-full" />
                </div>
              </div>
            </div>

            {/* Tournament Location with Free Autocomplete */}
            <div className="create-tournament-form-group-full">
              <label className="create-tournament-label-full">
                Tournament Location <span className="create-tournament-required-full">*</span>
              </label>
              <div className="create-tournament-location-wrapper-full">
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Start typing location in India..."
                  className="create-tournament-input-full"
                />
                <IoLocationOutline className="create-tournament-location-icon-full" />
                
                {/* Free Location Suggestions */}
                {showSuggestions && (
                  <div className="create-tournament-suggestions-dropdown">
                    {isSearching && (
                      <div className="create-tournament-suggestion-item loading">
                        Searching locations...
                      </div>
                    )}
                    {!isSearching && locationSuggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="create-tournament-suggestion-item"
                        onClick={() => handleLocationSelect(suggestion)}
                      >
                        <IoLocationOutline className="create-tournament-suggestion-icon" />
                        <span>{suggestion.display_name}</span>
                      </div>
                    ))}
                    {!isSearching && locationSuggestions.length === 0 && (
                      <div className="create-tournament-suggestion-item no-results">
                        No locations found
                      </div>
                    )}
                  </div>
                )}
              </div>
              <small className="create-tournament-location-help">
                Type to search for venues, cities, or addresses across India 
              </small>
            </div>

            {/* Free Map Preview */}
            {formData.coordinates && (
              <div className="create-tournament-form-group-full">
                <label className="create-tournament-label-full">Location Preview</label>
                <div className="create-tournament-map-container-full">
                  <MapContainer
                    center={formData.coordinates}
                    zoom={15}
                    style={{ height: '300px', width: '100%' }}
                    className="create-tournament-leaflet-map"
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <Marker position={formData.coordinates}>
                      <Popup>
                        <div>
                          <strong>{formData.selectedPlace?.display_name}</strong>
                        </div>
                      </Popup>
                    </Marker>
                  </MapContainer>
                  <div className="create-tournament-location-info-full">
                    <h4 className="create-tournament-location-name-full">
                      Selected Location
                    </h4>
                    <p className="create-tournament-location-address-full">
                      {formData.selectedPlace?.display_name}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Cover Image */}
            <div className="create-tournament-form-group-full">
              <label className="create-tournament-label-full">Tournament Poster</label>
              <div className="create-tournament-file-upload-wrapper-full">
                <input
                  type="file"
                  id="coverImage"
                  name="coverImage"
                  onChange={handlePoster}
                  className="create-tournament-file-input-full"
                  accept="image/*"
                />
                <label htmlFor="coverImage" className="create-tournament-file-upload-label-full">
                  <IoCloudUploadOutline className="create-tournament-upload-icon-full" />
                  <div className="create-tournament-upload-content-full">
                    <span className="create-tournament-upload-text-full">
                      {formData.coverImage ? <img src={formData.coverImage}/> : 'Click to upload or drag and drop'}
                    </span>
                    <span className="create-tournament-upload-subtext-full">PNG, JPG or JPEG (MAX. 5MB)</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="create-tournament-form-actions-full">
              {/* <button 
                type="button" 
                className="create-tournament-btn-full create-tournament-btn-secondary-full"
                onClick={handleSave}
              >
                Save Draft
              </button> */}
              <button 
                type="button" 
                className="create-tournament-btn-full create-tournament-btn-primary-full"
                onClick={handleNextStep}
              >
                Add Details & Continue
                <IoAdd className="create-tournament-btn-icon-full" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Tournament Details Component (Rich Text Editor Page)




const TournamentDetails = ({ formData, setFormData, onBack }) => {
  const [editorContent, setEditorContent] = useState(formData.description || '');
  // const [posterFile, setPosterFile] = useState(null);
  const [selectedText, setSelectedText] = useState('');
  const textareaRef = useRef(null);



  const { backend_URL,  } = useContext(OrganizerContext);

  const navigate = useNavigate();



  const [isSubmitting,setIsSubmitting] = useState(false);

  // const handlePosterUpload = (e) => {
  //   const file = e.target.files[0];
  //   if (file) {
  //     setPosterFile(file);
  //   }
  // };

  const handleDescription = (evt)=>{
     setFormData(prev => ({
      ...prev,
      description: evt.target.value
    }));
  }

  const handleSave = async() => {
    console.log(formData);
    try{
          setIsSubmitting(true);
          const fetchOptions = {
            method:"POST",
            credentials:"include",
            headers:{
              "Content-Type":"application/json"
            },
            body:JSON.stringify(formData)
          }
    
          const response = await fetch(`${backend_URL}/api/organizer/createTournament`,fetchOptions);
          const data = await response.json();
          if(data.success){
            toast.success(data.message);
            navigate('/organizer/tournaments');
          }else{
            console.log(data);
            toast.error(data.message);
          }
        }catch(error){
            console.log("Error in Front-End Create Tournament Handler ", error);
            toast.error(error);
        }finally{
          setIsSubmitting(false);
        }


  };



  // Get selected text from textarea
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

  // Insert text at cursor position
  const insertAtCursor = (insertText, replaceSelected = false) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const beforeText = formData.description.substring(0, start);
      const afterText = formData.description.substring(replaceSelected ? end : start);
      
      const newContent = beforeText + insertText + afterText;
      // setEditorContent(newContent);
      setFormData((prev)=>{
        return{
          ...prev,
          description:newContent
        }
      })
      
      // Set cursor position after inserted text
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + insertText.length, start + insertText.length);
      }, 0);
    }
  };

  // Wrap selected text with formatting
  const wrapSelectedText = (prefix, suffix = '') => {
    const selection = getSelectedText();
    if (selection.text) {
      const wrappedText = prefix + selection.text + (suffix || prefix);
      const beforeText = formData.description.substring(0, selection.start);
      const afterText = formData.description.substring(selection.end);
      
      const newContent = beforeText + wrappedText + afterText;
      // setEditorContent(newContent);
      setFormData((prev)=>{
        return{
          ...prev,
          description:newContent
        }
      })
      
      // Maintain selection
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

  // Toolbar functions
  const handleBold = () => wrapSelectedText('**');
  const handleItalic = () => wrapSelectedText('*');
  const handleUnderline = () => wrapSelectedText('<u>', '</u>');
  const handleStrikethrough = () => wrapSelectedText('~~');
  const handleQuote = () => insertAtCursor('> ');
  const handleH1 = () => insertAtCursor('# ');
  const handleH2 = () => insertAtCursor('## ');
  const handleBulletList = () => insertAtCursor('• ');
  const handleNumberedList = () => insertAtCursor('1. ');
  const handleSubscript = () => wrapSelectedText('<sub>', '</sub>');
  const handleSuperscript = () => wrapSelectedText('<sup>', '</sup>');
  const handleAlignLeft = () => insertAtCursor('\n<div style="text-align: left;">\n', '\n</div>\n');
  const handleAlignCenter = () => insertAtCursor('\n<div style="text-align: center;">\n', '\n</div>\n');
  const handleLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      const selection = getSelectedText();
      const linkText = selection.text || 'link text';
      wrapSelectedText(`[${linkText}](${url})`);
    }
  };

  // Convert markdown-like syntax to HTML for preview
  const convertToHTML = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/~~(.*?)~~/g, '<del>$1</del>')
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>')
      .replace(/^• (.*$)/gm, '<li>$1</li>')
      .replace(/^(\d+)\. (.*$)/gm, '<li>$1. $2</li>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
      .replace(/\n/g, '<br>');
  };

  return (
    <div className="create-tournament-layout-full">
      <div className="create-tournament-container-full">
        {/* Header */}
        <div className="create-tournament-header-full">
          <button className="create-tournament-back-btn-full" onClick={onBack}>
            <IoChevronBack className="create-tournament-back-icon-full" />
            Back to Basic Info to Save/Update
          </button>
        </div>

        <div className="create-tournament-details-layout-full">
          {/* Editor Section */}
          <div className="create-tournament-editor-section-full">
            <div className="create-tournament-card-full">
              <div className="create-tournament-card-header-full">
                <h2 className="create-tournament-section-title-full">DETAILS & POSTER</h2>
              </div>

              {/* Rich Text Editor */}
              <div className="create-tournament-editor-wrapper-full">
                <div className="create-tournament-editor-header-full">
                  <span className="create-tournament-editor-label-full">
                    DETAILS (5000 CHARACTERS) 
                    <span className="create-tournament-char-count-full">{formData.description.length} characters</span>
                  </span>
                </div>
                
                {/* Toolbar */}
                <div className="create-tournament-editor-toolbar-full">
                  <button 
                    className="create-tournament-toolbar-btn-full create-tournament-toolbar-bold-full"
                    onClick={handleBold}
                    title="Bold"
                  >
                    B
                  </button>
                  <button 
                    className="create-tournament-toolbar-btn-full create-tournament-toolbar-italic-full"
                    onClick={handleItalic}
                    title="Italic"
                  >
                    I
                  </button>
                  <button 
                    className="create-tournament-toolbar-btn-full create-tournament-toolbar-underline-full"
                    onClick={handleUnderline}
                    title="Underline"
                  >
                    U
                  </button>
                  <button 
                    className="create-tournament-toolbar-btn-full create-tournament-toolbar-strike-full"
                    onClick={handleStrikethrough}
                    title="Strikethrough"
                  >
                    S
                  </button>
                  <div className="create-tournament-toolbar-divider-full"></div>
                  <button 
                    className="create-tournament-toolbar-btn-full"
                    onClick={handleQuote}
                    title="Quote"
                  >
                    "
                  </button>
                  <button 
                    className="create-tournament-toolbar-btn-full"
                    onClick={handleH1}
                    title="Heading 1"
                  >
                    H1
                  </button>
                  <button 
                    className="create-tournament-toolbar-btn-full"
                    onClick={handleH2}
                    title="Heading 2"
                  >
                    H2
                  </button>
                  <div className="create-tournament-toolbar-divider-full"></div>
                  <button 
                    className="create-tournament-toolbar-btn-full"
                    onClick={handleBulletList}
                    title="Bullet List"
                  >
                    •
                  </button>
                  <button 
                    className="create-tournament-toolbar-btn-full"
                    onClick={handleNumberedList}
                    title="Numbered List"
                  >
                    1.
                  </button>
                  <div className="create-tournament-toolbar-divider-full"></div>
                  <button 
                    className="create-tournament-toolbar-btn-full"
                    onClick={handleSubscript}
                    title="Subscript"
                  >
                    x₂
                  </button>
                  <button 
                    className="create-tournament-toolbar-btn-full"
                    onClick={handleSuperscript}
                    title="Superscript"
                  >
                    x²
                  </button>
                  <div className="create-tournament-toolbar-divider-full"></div>
                  <button 
                    className="create-tournament-toolbar-btn-full"
                    onClick={handleAlignLeft}
                    title="Align Left"
                  >
                    ≡
                  </button>
                  <button 
                    className="create-tournament-toolbar-btn-full"
                    onClick={handleAlignCenter}
                    title="Align Center"
                  >
                    ≡
                  </button>
                  <button 
                    className="create-tournament-toolbar-btn-full"
                    onClick={handleLink}
                    title="Insert Link"
                  >
                    🔗
                  </button>
                </div>

                {/* Editor Content */}
                <textarea
                  ref={textareaRef}
                  value={formData.description}
                  onChange={(e) => { handleDescription(e) }}
                  className="create-tournament-editor-textarea-full"
                  placeholder="The Description of the event should be like this..."
                  maxLength={5000}
                />

                {/* Formatting Help */}
                <div className="create-tournament-formatting-help">
                  <small>
                    <strong>Formatting Help:</strong> 
                    **bold** | *italic* | ~~strikethrough~~ | # Heading 1 | ## Heading 2 | {'>'} Quote | • Bullet | 1. Number
                  </small>
                </div>
              </div>

              {/* Tournament Poster */}
              {/* <div className="create-tournament-poster-section-full">
                <label className="create-tournament-label-full">TOURNAMENT POSTER</label>
                <div className="create-tournament-poster-upload-full">
                  <input
                    type="file"
                    id="tournamentPoster"
                    onChange={handlePosterUpload}
                    className="create-tournament-file-input-full"
                    accept="image/*"
                  />
                  <label htmlFor="tournamentPoster" className="create-tournament-poster-upload-btn-full">
                    {posterFile ? posterFile.name : 'UPLOAD'}
                  </label>
                  {posterFile && (
                    <div className="create-tournament-poster-preview">
                      <img 
                        src={URL.createObjectURL(posterFile)} 
                        alt="Tournament Poster Preview"
                        className="create-tournament-poster-image"
                      />
                    </div>
                  )}
                </div>
              </div> */}

              {/* Save Button */}
              <div className="create-tournament-details-actions">
                <button 
                  type="button" 
                  className="create-tournament-btn-full create-tournament-btn-primary-full"
                  onClick={handleSave}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving Details.....' : 'Save Tournament Details'}
                  {/* Save Tournament Details */}
                </button>
              </div>
            </div>
          </div>

          {/* Preview Section */}
          <div className="create-tournament-preview-section-full">
            <div className="create-tournament-preview-card-full">
              <h3 className="create-tournament-preview-title-full">LIVE PREVIEW</h3>
              <div className="create-tournament-preview-content-full">
                {formData.description ? (
                  <div dangerouslySetInnerHTML={{ __html: convertToHTML(formData.description) }} />
                ) : (
                  <p style={{ color: '#9ca3af', fontStyle: 'italic' }}>
                    Start typing to see preview...
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TournamentForm;
