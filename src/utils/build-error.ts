import HttpStatus from 'http-status-codes';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';  // Import Prisma types

// Helper function to extract Prisma validation errors
const extractPrismaErrorDetails = (err: Prisma.PrismaClientKnownRequestError) => {
  // Prisma errors typically have `meta` containing more detailed info
  return err.meta ? Object.values(err.meta) : ['Unknown error details'];
}

// Build error response
function buildError(err: unknown) {
  // Type guard to handle Zod validation errors
  if (err instanceof ZodError) {
    return {
      code: HttpStatus.BAD_REQUEST,
      message: HttpStatus.getStatusText(HttpStatus.BAD_REQUEST),
      details: err.issues.map((issue) => issue.message),
    };
  }

  // Handle Prisma client known errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Handle specific Prisma error codes here
    if (err.code === 'P2002') {
      // Unique constraint violation (duplicate entry)
      return {
        code: HttpStatus.BAD_REQUEST,
        message: 'Duplicate entry',
        details: [`Duplicate value for field ${err.meta?.target}`],
      };
    }
    // You can handle other Prisma error codes in a similar manner
    return {
      code: HttpStatus.BAD_REQUEST,
      message: `Prisma error: ${err.message}`,
      details: extractPrismaErrorDetails(err),
    };
  }

  // Handle Prisma validation errors
  if (err instanceof Prisma.PrismaClientValidationError) {
    return {
      code: HttpStatus.BAD_REQUEST,
      message: 'Prisma validation error',
      details: [err.message],
    };
  }

  // Handle general Prisma errors
  if (err instanceof Prisma.PrismaClientInitializationError) {
    return {
      code: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Prisma client initialization error',
      details: [err.message],
    };
  }

  // Handle Zod validation errors (if any)
  if (err instanceof ZodError) {
    return {
      code: HttpStatus.BAD_REQUEST,
      message: HttpStatus.getStatusText(HttpStatus.BAD_REQUEST),
      details: err.issues.map((issue) => issue.message),
    };
  }

  // Catch-all for any unhandled errors
  console.error('Internal Server Error:', err); // Enhanced logging for unexpected errors
  return {
    code: HttpStatus.INTERNAL_SERVER_ERROR,
    message: 'An unexpected error occurred on the server. Please try again later.',
    details: err instanceof Error ? [err.message] : ['Unknown error'],
  };
}

export default buildError;
