// Simple syntax test file
const React = require('react');

const TestComponent = () => {
  return React.createElement('div', null, 'Hello World');
};

// Test JSX-like structure
const JSXTest = `
  <div>
    <PullToRefresh>
      <ResponsiveDashboardLayout>
        <div>Content</div>
      </ResponsiveDashboardLayout>
    </PullToRefresh>
  </div>
`;

console.log('Syntax test completed successfully');
module.exports = { TestComponent, JSXTest };
