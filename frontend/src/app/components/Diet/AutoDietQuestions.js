import React, { useState } from 'react';
import axios from 'axios';
import './AutoDietQuestions.css'; // Assuming you have a CSS file for styling

const questions = [
  { id: 'age', question: 'Ile masz lat?', type: 'number' },
  { id: 'weight', question: 'Jaka jest Twoja waga (kg)?', type: 'number' },
  { id: 'height', question: 'Jaki jest Twój wzrost (cm)?', type: 'number' },
  { id: 'sex', question: 'Jaka jest Twoja płeć?', type: 'select', options: ['male', 'female'] },
  { id: 'activityLevel', question: 'Jaki jest Twój poziom aktywności?', type: 'select', options: ['sedentary', 'light', 'moderate', 'active', 'very_active'] },
  { id: 'goal', question: 'Jaki jest Twój cel?', type: 'select', options: ['lose', 'maintain', 'gain'] },
  { id: 'rate', question: 'Jak szybko chcesz osiągnąć cel ( 0.X kg na tydzień)?', type: 'number' },
];

//after delay from last click, to blur funtion
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));  


const AutoDietQuestions = ({ onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});

  const currentQuestion = questions[currentIndex];

  const handleChange = (e) => {
    let value = e.target.value;
    if (e.target.type === 'number') {
      // Allow user to type freely, but validate on blur
      value = e.target.value === '' ? '' : Number(e.target.value);
    }
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: value }));
  };




  const handleBlur = (e) => {
   
    let value = e.target.value === '' ? '' : Number(e.target.value);
    if (value !== '') {
      if (currentQuestion.id === 'weight') {
        if (value < 40) value = 40;
        if (value > 250) value = 250;
      } else if (currentQuestion.id === 'height') {
        if (value < 100) value = 100;
        if (value > 250) value = 250;
      } else if (currentQuestion.id === 'age') {
        if (value < 10) value = 10;
        if (value > 120) value = 120;
      } else if (currentQuestion.id === 'rate') {
        if (value < 0) value = 1;
        if (value > 9) value = 9;
      }
      setAnswers(prev => ({ ...prev, [currentQuestion.id]: value }));
    }
    
  };


  const handleNext = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Submit answers to backend to generate diet plan
      try {
        const response = await axios.post('/api/diet/auto', answers);
        alert(response.data.message);
        onComplete();
      } catch (error) {
        alert('Błąd podczas tworzenia planu diety');
      }
    }
  };


  return (
    <div className="box">
      <h3 className="title is-4">{currentQuestion.question}</h3>
      {currentQuestion.type === 'select' ? (
        <div className="select is-danger" style={{ marginBottom: '1rem' }}>
          <select onChange={handleChange} value={answers[currentQuestion.id] || ''}>
            <option value="" disabled>Wybierz opcję</option>
            {currentQuestion.options.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      ) : (
      <input
        className="input is-danger "
        type={currentQuestion.type}
        value={answers[currentQuestion.id] || ''}
        onBlur={handleBlur}
        onChange={handleChange}
        >
        
        </input>
        
      )}
      <button className="button is-link " onClick={handleNext} disabled={answers[currentQuestion.id] === undefined || answers[currentQuestion.id] === ''}>
        {currentIndex === questions.length - 1 ? 'Zakończ' : 'Dalej'}
      </button>
    </div>
    
  );
};

export default AutoDietQuestions;
