import React from 'react';

interface ActionButtonsProps {
  onStartHunt: () => void;
  onStopHunt: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ onStartHunt, onStopHunt }) => {
  return (
    <div className="action-buttons">
      <button id="startHuntButton" className="action-button start" onClick={onStartHunt}>
        <i className="fas fa-play"></i> Start Hunt
      </button>
      <button id="stopHuntButton" className="action-button stop" onClick={onStopHunt}>
        <i className="fas fa-stop"></i> Stop Hunt
      </button>
    </div>
  );
};

export default ActionButtons;
