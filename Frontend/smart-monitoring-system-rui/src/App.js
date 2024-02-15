import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faCog, faArrowAltCircleLeft, faArrowAltCircleRight } from '@fortawesome/free-solid-svg-icons';
import './App.css';

function NavigationSideMenu() {
  const [expanded, setExpanded] = useState(false);

  const toggleNavbar = () => {
    setExpanded(!expanded);
  };

  return (
    <div className={`navbar ${expanded ? 'expanded' : ''}`}>
      <li>
        <button>
          <div className='side-menu-button-content'>
            <FontAwesomeIcon icon={faHome} size='2x' />
            <p>{expanded ? "Home" : ''}</p>
          </div>
        </button>
      </li>
      <li>
        <button>
          <div className='side-menu-button-content'>
            <FontAwesomeIcon icon={faCog} size='2x' />
            <p>{expanded ? 'Settings' : ''}</p>
          </div>
        </button>
      </li>
      <li>
        <button onClick={toggleNavbar}>
          {expanded ? <FontAwesomeIcon icon={faArrowAltCircleLeft} size='2x' /> : <FontAwesomeIcon icon={faArrowAltCircleRight} size='2x' />}
        </button>
      </li>
    </div>
  );
}

export default NavigationSideMenu;