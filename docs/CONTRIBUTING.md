# Contributing to AI-Pesa

Thank you for your interest in contributing to AI-Pesa! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

Please be respectful and considerate of others when contributing to this project. We aim to foster an inclusive and welcoming community.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/AI-Mpesa-Accountant.git`
3. Create a new branch for your feature or bug fix: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Commit your changes with descriptive commit messages
6. Push to your branch: `git push origin feature/your-feature-name`
7. Create a pull request

## Development Environment Setup

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn
- Google AI Studio account (for Gemini API key)

### Frontend Setup

```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install --legacy-peer-deps

# Start development server
npm run dev
```

### Backend Setup

```bash
# Navigate to the backend directory
cd backend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Gemini AI Setup

1. Create a Google AI Studio account at [makersuite.google.com](https://makersuite.google.com)
2. Generate an API key in the Google AI Studio
3. Add the API key to your backend `.env` file:
   ```
   GEMINI_API_KEY=your_api_key_here
   GEMINI_MODEL=gemini-pro
   ```

## Project Structure

The project is organized as follows:

```
/
├── frontend/    # Next.js frontend application
├── backend/     # Express.js backend with Gemini AI integration
├── docs/        # Project documentation
```

## Coding Standards

### General Guidelines

- Follow consistent coding style
- Write clear, descriptive variable and function names
- Add comments for complex logic
- Keep functions small and focused on a single task
- Write unit tests for new functionality

### JavaScript/TypeScript

- Use ES6+ features
- Use TypeScript for type safety
- Follow the [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- Use async/await for asynchronous code
- Use destructuring and spread operators where appropriate

### React/Next.js

- Use functional components with hooks
- Keep components small and reusable
- Use proper prop types or TypeScript interfaces
- Follow the [React Hooks documentation](https://reactjs.org/docs/hooks-intro.html)

### Backend

- Follow RESTful API design principles
- Use the standardized API response format
- Implement proper error handling
- Add validation for all input data
- Write middleware for common functionality

## Working with Gemini AI

When working with the Gemini AI integration:

1. **Prompt Engineering**: Carefully design prompts for optimal AI responses
2. **Context Management**: Provide sufficient context for the AI to generate relevant responses
3. **Error Handling**: Implement robust error handling for AI API calls
4. **Rate Limiting**: Be mindful of API rate limits and implement appropriate throttling
5. **Security**: Never expose your API key in client-side code

## Model Consistency

To ensure data consistency between frontend and backend:

- Follow the guidelines in [Model Consistency](./MODEL_CONSISTENCY.md)
- Ensure TypeScript interfaces match MongoDB schemas
- Update both frontend and backend when changing model structures

## Pull Request Process

1. Ensure your code follows the project's coding standards
2. Update documentation if necessary
3. Add tests for new functionality
4. Make sure all tests pass
5. Update the README.md with details of changes if applicable
6. The pull request will be reviewed by maintainers
7. Address any feedback or requested changes
8. Once approved, your pull request will be merged

## Reporting Bugs

When reporting bugs, please include:

- A clear and descriptive title
- Steps to reproduce the bug
- Expected behavior
- Actual behavior
- Screenshots if applicable
- Environment information (browser, OS, etc.)

## Feature Requests

When suggesting features, please include:

- A clear and descriptive title
- Detailed description of the feature
- Explanation of why this feature would be useful
- Examples of how the feature would work
- Any relevant references or examples from other projects

## Documentation

- Keep documentation up to date
- Document all API endpoints
- Document all models and their fields
- Add JSDoc comments to functions and classes
- Update the README.md with any significant changes

## Testing

- Write unit tests for new functionality
- Ensure all tests pass before submitting a pull request
- Test your changes in different browsers and environments

## License

By contributing to AI-Pesa, you agree that your contributions will be licensed under the project's MIT license.

## Questions

If you have any questions about contributing, please open an issue or contact the project maintainers.

Thank you for contributing to AI-Pesa! 