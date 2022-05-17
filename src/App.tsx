import React from 'react';

function App() {
  return (
    <div>
      <p>{process.env.REACT_APP_API_URL}</p>
    </div>
  );
}

export default App;
