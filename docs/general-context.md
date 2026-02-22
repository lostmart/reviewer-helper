# Advanced JavaScript - EPITA Course Context

## Course Information

- **Institution:** EPITA (École pour l'informatique et les techniques avancées)
- **Program:** Second Year Computer Science
- **Course:** Advanced JavaScript Programming (Programmation JavaScript avancée)
- **Duration:** 30 hours
- **Academic Year:** 2025/2026
- **Instructor:** Martin P.

## Course Objectives

Students will master professional-level JavaScript development techniques through three core learning objectives:

### 1. Apply a Domain-Driven Approach

Students learn to design JavaScript applications by modeling their structure around specific business or application domains, enhancing clarity and adaptability within the codebase.

### 2. Develop Modular and Component-Based Architecture

Gain expertise in creating reusable and organized JavaScript modules and components, enabling efficient code organization, maintainability, and scalability.

### 3. Implement Observer Pattern and Namespace Organization

Understand and apply the Observer Pattern for handling event-driven interactions and use namespace organization techniques to avoid global scope pollution, ensuring robust and modular application structures.

## Course Topics

- **Domain-Driven Design (DDD)** - Structuring applications around business domains with clear entities, value objects, and business rules
- **Modules and Components** - Creating reusable, well-organized code structures
- **Observer Pattern** - Implementing event-driven architectures for decoupled systems
- **Namespace Organization** - Preventing global scope pollution and maintaining clean module boundaries
- **Type Safety** - Using TypeScript to enforce domain invariants and prevent bugs
- **RESTful API Design** - Best practices for building maintainable web services
- **Separation of Concerns** - Layered architecture (domain, application, infrastructure, presentation)

## Teaching Methodology

### Theory + Practice Approach

1. **Quick theory overview** - Introduce concepts with context
2. **Isolated exercises** - 5-minute hands-on exercises to feel the concepts
3. **Group discussion** - Reflect on discoveries and insights
4. **Project application** - Apply concepts to real-world scenarios

### Legacy Code Refactoring

Students experience the "pain" of poorly structured code before learning architectural patterns:

- Start with intentionally flawed "God Function" implementations
- Identify problems through hands-on experience
- Progressively refactor into clean, domain-driven architecture
- Compare before/after to understand the value of each pattern

## Main Project: University Enrollment System

A real-world domain modeling exercise where students refactor a legacy enrollment system into a robust, DDD-based architecture.

**Domain Concepts:**

- Student, Course, Enrollment entities
- Academic Load, Credits, Capacity constraints
- Business rules: email validation, credit limits, prerequisites, course capacity
- Event-driven notifications (student enrolled, course full)

**Technical Stack:**

- Runtime: Node.js (LTS)
- Language: TypeScript (strict mode)
- Database: SQLite (better-sqlite3)
- Architecture: Modular Monolith with DDD principles

**Key Learning Outcomes:**

- Extract Value Objects from primitives (Email, Credits, StudentId)
- Build Entities with behavior, not just data containers
- Implement Repository pattern for persistence ignorance
- Use Domain Events for decoupled notifications
- Organize code into proper layers (domain, application, infrastructure, presentation)

## Preparatory Exercises: Restaurant Domain

Simple TypeScript exercises using a restaurant domain to explore:

- Primitive obsession problems (price, quantity as raw numbers)
- String confusion (email vs phone vs name - all just strings)
- Business rule violations (table overcapacity, negative values)
- Identity crisis (inconsistent ID formats)
- Silent errors that TypeScript doesn't catch without domain types

**Exercise Format:**

- CLI-based input
- Silent errors logged to file for investigation
- Students discover bugs through log analysis
- Discussion prompts after each exercise

## Technical Environment

**Development Tools:**

- VS Code (recommended)
- Node.js LTS
- TypeScript with strict mode
- Git for version control

**Key Dependencies:**

- TypeScript
- tsx (for running TS files directly)
- Express (for REST APIs)
- better-sqlite3 (for database)
- @types/node (for Node.js types)

## Course Progression

1. **Introduction** - Review JavaScript fundamentals, setup environment
2. **Type Safety & Domain Primitives** - Value Objects, primitive obsession
3. **Domain Modeling** - Entities, aggregates, domain services
4. **Persistence Layer** - Repository pattern, database abstraction
5. **Event-Driven Architecture** - Observer pattern, domain events
6. **API Layer** - RESTful design, separation of concerns
7. **Integration & Testing** - Bringing it all together

## Key Principles Emphasized

**Domain-Driven Design:**

- Ubiquitous language (business terms in code)
- Bounded contexts (clear domain boundaries)
- Entities vs Value Objects
- Aggregates and invariant protection
- Domain events for side effects

**Type Safety:**

- No primitive obsession
- Value Objects with validation
- Impossible states made unrepresentable
- Type-driven development

**Separation of Concerns:**

- Domain layer: Pure business logic, no dependencies
- Application layer: Use cases, orchestration
- Infrastructure layer: Technical implementation (DB, APIs)
- Presentation layer: HTTP/UI concerns

**Clean Architecture:**

- Dependency inversion (domain has no dependencies)
- Persistence ignorance (domain doesn't know about DB)
- Testability (domain logic testable without infrastructure)

## Resources & References

**Domain-Driven Design:**

- Eric Evans - "Domain-Driven Design: Tackling Complexity in the Heart of Software"
- Martin Fowler - DDD articles and patterns
- Vladimir Khorikov - DDD in practice

**Architecture:**

- Robert C. Martin - "Clean Architecture"
- Hexagonal Architecture (Ports & Adapters)
- Modular Monolith pattern

**TypeScript & Type Safety:**

- TypeScript Handbook
- Effective TypeScript by Dan Vanderkam
- Type-Driven Development principles

## Student Expectations

Students should:

- Have foundational JavaScript knowledge
- Be comfortable with basic TypeScript syntax
- Understand object-oriented programming concepts
- Be willing to challenge their existing coding habits
- Actively participate in discussions and exercises
- Complete hands-on refactoring assignments
- Ask questions when architectural decisions are unclear

## Assessment Focus

While not specified in detail, assessment likely focuses on:

- Understanding of DDD principles and terminology
- Ability to identify and refactor code smells
- Implementation of proper layered architecture
- Use of TypeScript for domain modeling
- Application of design patterns (Repository, Observer)
- Code quality, maintainability, and testability

## Folder Structure

The original repo has two main folders:

"explain" - Contains the code examples and instructions for the exercises. Ignore this folder.

"exercises" - Contains the student's work for the exercises

index.ts code

```typescript
import * as readline from "readline"

import { exercise1_PrimitivePrice } from "./exercises/exercise1.js"
import { exercise2_PrimitiveQuantity } from "./exercises/exercise2.js"
import { exercise3_StringConfusion } from "./exercises/exercise3.js"
import { exercise4_BusinessRuleViolation } from "./exercises/exercise4.js"
import { exercise5_IdentityCrisis } from "./exercises/exercise5.js"
import { exercise6_TemporalLogic } from "./exercises/exercise6.js"
import { exercise7_CurrencyConfusion } from "./exercises/exercise7.js"
import { exercise8_EmailValidation } from "./exercises/exercise8.js"

//============================================================================
// MAIN CLI INTERFACE
// ============================================================================

async function runExercises() {
	console.log("🍽️  Domain-Driven Design: Restaurant Domain Exercises")
	console.log("=".repeat(60))
	console.log("\nThese exercises demonstrate SILENT ERRORS that TypeScript")
	console.log("doesn't catch when we use primitive types.\n")
	console.log(
		"After running, check 'silent_errors.log' to see what went wrong!\n",
	)

	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	})

	const question = (prompt: string): Promise<string> => {
		return new Promise((resolve) => {
			rl.question(prompt, resolve)
		})
	}

	// Let user trigger each exercise
	console.log("\n📋 Available Exercises:")
	console.log("1. Primitive Price Problem")
	console.log("2. Primitive Quantity Disaster")
	console.log("3. String Confusion (Email/Phone/Name)")
	console.log("4. Business Rule Violation (Table Capacity)")
	console.log("5. Identity Crisis (Order IDs)")
	console.log("6. Temporal Logic Error (Operating Hours)")
	console.log("7. Currency Confusion")
	console.log("8. Email Validation Gap")
	console.log("9. Run ALL exercises")
	console.log("0. Exit\n")

	let running = true

	while (running) {
		const choice = await question("Select an exercise (0-9): ") // await; because the return value is Promise

		switch (choice.trim()) {
			case "1":
				exercise1_PrimitivePrice()
				console.log("✅ Exercise 1 completed. Check the log file!\n")
				break
			case "2":
				exercise2_PrimitiveQuantity()
				console.log("✅ Exercise 2 completed. Check the log file!\n")
				break
			case "3":
				exercise3_StringConfusion()
				console.log("✅ Exercise 3 completed. Check the log file!\n")
				break
			case "4":
				exercise4_BusinessRuleViolation()
				console.log("✅ Exercise 4 completed. Check the log file!\n")
				break
			case "5":
				exercise5_IdentityCrisis()
				console.log("✅ Exercise 5 completed. Check the log file!\n")
				break
			case "6":
				exercise6_TemporalLogic()
				console.log("✅ Exercise 6 completed. Check the log file!\n")
				break
			case "7":
				exercise7_CurrencyConfusion()
				console.log("✅ Exercise 7 completed. Check the log file!\n")
				break
			case "8":
				exercise8_EmailValidation()
				console.log("✅ Exercise 8 completed. Check the log file!\n")
				break
			case "9":
				console.log("\n🔄 Running all exercises...\n")
				exercise1_PrimitivePrice()
				exercise2_PrimitiveQuantity()
				exercise3_StringConfusion()
				exercise4_BusinessRuleViolation()
				exercise5_IdentityCrisis()
				exercise6_TemporalLogic()
				exercise7_CurrencyConfusion()
				exercise8_EmailValidation()
				console.log("✅ All exercises completed. Check the log file!\n")
				break
			case "0":
				running = false
				console.log("\n👋 Exiting. Review 'silent_errors.log' for findings!\n")
				break
			default:
				console.log("❌ Invalid choice. Try again.\n")
		}
	}

	rl.close()
}

// Run the interactive CLI
runExercises().catch(console.error)

export default runExercises
```

## Expected results:

- no irrational values can be accepted e.i. no negative prices or quantities
- no empty strings can be accepted e.i. no empty names, emails, or phone numbers
- no invalid email addresses can be accepted e.i. no invalid emails
- no invalid phone numbers can be accepted e.i. no invalid phone numbers
- No testing framework, but the assignment specifies (not worth mentioning)
- Ignore any other errors out of scope of the assignment
