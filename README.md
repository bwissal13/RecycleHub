# RecycleHub

RecycleHub is a web application built with Angular that facilitates waste collection and recycling through a reward-based system. The platform connects users with collectors and promotes sustainable waste management practices.

## Project Structure

```
src/
├── app/
│   ├── core/                 # Core functionality
│   │   ├── guards/          # Authentication and route guards
│   │   ├── interceptors/    # HTTP interceptors
│   │   ├── services/        # Core services
│   │   └── store/           # State management
│   ├── features/            # Feature modules
│   │   ├── auth/           # Authentication feature
│   │   ├── collecte/       # Collection management
│   │   ├── collecteur/     # Collector dashboard
│   │   ├── points/         # Points and rewards
│   │   └── profile/        # User profile management
│   └── shared/             # Shared components and utilities
└── environments/           # Environment configurations
```

## Features

### 1. User Authentication (REC-23)
- User registration and login
- Password reset functionality
- Profile management
- Authentication guards and interceptors

### 2. Collection Request System (REC-24)
- Create collection requests
- Upload waste photos
- Specify collection details (weight, address, time slot)
- Track request status
- Group multiple requests
- Maximum request limits

### 3. Collector Management (REC-25)
- Collector dashboard
- Collection verification
- Accept/reject collection requests
- Collection status management

### 4. Points and Rewards System (REC-26)
- View points balance
- Track points history
- Convert points to rewards
- Achievement levels

## Getting Started

1. Clone the repository
```bash
git clone https://github.com/yourusername/RecycleHub.git
```

2. Install dependencies
```bash
npm install
```

3. Run the development server
```bash
ng serve
```

4. Navigate to `http://localhost:4200/`

## Branch Structure

- `main`: Production-ready code
- `feature/REC-23-user-registration`: Authentication and profile features
- `REC-24-Demande-de-Collecte`: Collection request system
- `REC-25-Gestion-des-Collecteurs`: Collector management
- `REC-26-Système-de-Points-et-Récompenses`: Points and rewards system

## Contributing

Please follow the branch naming convention when contributing:
- Feature branches: `feature/REC-XX-feature-name`
- Bug fixes: `fix/REC-XX-bug-description`
- Hotfixes: `hotfix/REC-XX-description`

## Technologies Used

- Angular 16+
- NgRx for state management
- Angular Material UI
- TypeScript
- SCSS for styling

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
