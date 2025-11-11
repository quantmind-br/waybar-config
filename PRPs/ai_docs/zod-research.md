# Zod Validation Research

Schema validation patterns for complex configuration validation with Zod.

**Source**: Official Zod documentation and configuration validation patterns.

## Quick Reference

- **Docs**: https://zod.dev/
- **GitHub**: https://github.com/colinhacks/zod
- **API**: https://zod.dev/api

## Critical Patterns for Configuration Validation

### 1. Always Use .safeParse() for User Input

```typescript
// ❌ BAD - Throws errors, crashes app
const result = schema.parse(userInput);

// ✅ GOOD - Returns discriminated union
const result = schema.safeParse(userInput);

if (!result.success) {
  console.error(result.error); // ZodError
  return;
}

console.log(result.data); // Typed data
```

### 2. Type Inference

```typescript
const UserSchema = z.object({
  name: z.string(),
  age: z.number(),
});

// Automatic type inference
type User = z.infer<typeof UserSchema>;
// Result: { name: string; age: number; }
```

### 3. Nested Object Validation

```typescript
const AddressSchema = z.object({
  street: z.string(),
  city: z.string(),
  country: z.string(),
});

const PersonSchema = z.object({
  name: z.string(),
  address: AddressSchema, // Nested schema
});
```

### 4. Discriminated Unions (Module Type Variants)

```typescript
const ModuleConfigSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("battery"),
    bat: z.string().optional(),
    interval: z.number().default(60),
  }),
  z.object({
    type: z.literal("clock"),
    format: z.string().default("{:%H:%M}"),
    timezone: z.string().optional(),
  }),
  z.object({
    type: z.literal("cpu"),
    interval: z.number().default(10),
  }),
]);

// TypeScript narrows type based on discriminator
const config = ModuleConfigSchema.parse(data);
if (config.type === "battery") {
  console.log(config.bat); // TypeScript knows this exists
}
```

### 5. Cross-Field Validation with .superRefine()

```typescript
const BarConfigSchema = z
  .object({
    height: z.number().optional(),
    width: z.number().optional(),
    position: z.enum(['top', 'bottom', 'left', 'right']),
  })
  .superRefine((data, ctx) => {
    // Vertical bars need width, horizontal need height
    if ((data.position === 'left' || data.position === 'right') && !data.width) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Width required for vertical bars",
        path: ["width"],
      });
    }

    if ((data.position === 'top' || data.position === 'bottom') && !data.height) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Height required for horizontal bars",
        path: ["height"],
      });
    }
  });
```

### 6. Custom Error Messages

```typescript
const ConfigSchema = z.object({
  name: z
    .string({
      required_error: "Bar name is required",
      invalid_type_error: "Bar name must be a string",
    })
    .min(1, "Bar name cannot be empty"),

  position: z
    .enum(['top', 'bottom', 'left', 'right'])
    .default('top'),

  height: z
    .number({
      required_error: "Height is required",
      invalid_type_error: "Height must be a number",
    })
    .int("Height must be a whole number")
    .positive("Height must be positive"),
});
```

### 7. Error Formatting

```typescript
// Flat format (best for forms)
const result = schema.safeParse(data);
if (!result.success) {
  const errors = result.error.flatten();
  console.log(errors.fieldErrors);
  // { name: ["Bar name is required"], height: ["Height must be positive"] }
}

// Tree format
const formatted = result.error.format();
console.log(formatted);
// {
//   _errors: [],
//   name: { _errors: ["Bar name is required"] },
//   height: { _errors: ["Height must be positive"] }
// }
```

### 8. Default Values

```typescript
const ConfigSchema = z.object({
  position: z.enum(['top', 'bottom']).default('top'),
  height: z.number().default(30),
  spacing: z.number().default(4),
}).default({});

// Even if empty object provided, defaults are applied
const config = ConfigSchema.parse({});
// { position: 'top', height: 30, spacing: 4 }
```

### 9. Recursive Schemas (Nested Modules)

```typescript
const ConfigNodeSchema: z.ZodType<ConfigNode> = z.lazy(() =>
  z.discriminatedUnion("type", [
    z.object({
      type: z.literal("group"),
      modules: z.array(ConfigNodeSchema),
    }),
    z.object({
      type: z.literal("module"),
      moduleType: z.string(),
      config: z.record(z.any()),
    }),
  ])
);
```

### 10. Schema Composition

```typescript
// Extend schemas
const BaseConfigSchema = z.object({
  position: z.enum(['top', 'bottom']),
});

const FullConfigSchema = BaseConfigSchema.extend({
  height: z.number(),
  modules: z.array(z.string()),
});

// Merge schemas
const schema1 = z.object({ a: z.string() });
const schema2 = z.object({ b: z.number() });
const merged = schema1.merge(schema2);

// Pick/Omit
const nameOnly = PersonSchema.pick({ name: true });
const withoutAge = PersonSchema.omit({ age: true });
```

## Common Pitfalls

1. **Don't use .parse()** - always use .safeParse() for user input
2. **Don't forget type inference** - use z.infer<typeof Schema>
3. **Don't create schemas inside functions** - define at module level
4. **Don't validate too frequently** - debounce to 300ms
5. **Don't ignore error paths** - use for field-level errors
