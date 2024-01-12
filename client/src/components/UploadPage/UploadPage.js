import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation, useParams } from 'react-router-dom';

import ImageProcessingModal from './ImageProcessingModal';

import './UploadPage.css';

const UploadPage = () => {

    const [selectedFiles, setSelectedFiles] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [imagePreview, setImagePreview] = useState([]);
    const [uploadDisabled, setUploadDisabled] = useState(true);

    const navigate = useNavigate();
    const location = useLocation();

    const { gameCode } = useParams();

    function useQuery() {
        return new URLSearchParams(location.search);
    }

    const query = useQuery();
    const username = query.get('username');

    const handleFileSelect = (event) => {

        if (!event.target.files || event.target.files.length === 0) {
            alert('Please Select Images to Upload');
        }

        const files = Array.from(event.target.files);
        setSelectedFiles(files);
        setImagePreview(files.map(file => URL.createObjectURL(file)));
        setUploadDisabled(false);

    };

    const handleImageSubmit = async (event) => {

        event.preventDefault();
        setIsProcessing(true);

        const formData = new FormData();

        for (const file in selectedFiles) {
            formData.append('images', selectedFiles[file]);
        }

        try {
            const response = await axios.post('http://localhost:3001/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            console.log(response.data);
            navigate(`/game/${gameCode}/lobby?username=${encodeURIComponent(username)}`);

        } catch (error) {
            console.log('Error uploading images: ', error);
        }

        setIsProcessing(false);

    };

    return (
        <div className="container">
      <h1 className="title">Upload Your Images</h1>
      <input 
        type="file" 
        id="imageInput" 
        multiple 
        onChange={handleFileSelect} 
        style={{ display: 'none' }} 
      />
      <label 
        htmlFor="imageInput" 
        className="button button-select"
      >
        Select Images
      </label>
      <div className="image-preview-container">
        {imagePreview.map((imagePreviewUrl, index) => (
          <div key={index} className="image-preview" style={{ backgroundImage: `url(${imagePreviewUrl})` }}>
            {/* Thumbnail will be displayed as a background image */}
          </div>
        ))}
      </div>
      <button 
        className="button button-upload" 
        onClick={handleImageSubmit}
        disabled={uploadDisabled}
      >
        Upload
      </button>
      <ImageProcessingModal isOpen={isProcessing} />
    </div>
    )

};

export default UploadPage;