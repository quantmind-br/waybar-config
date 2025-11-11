// ============================================================================
// CODE EDITOR - Monaco CSS Editor
// ============================================================================

import { useEffect, useState, useCallback } from 'react'
import Editor, { Monaco } from '@monaco-editor/react'
import { StyleDefinition, CSSProperty } from '../../lib/types/config'

// ============================================================================
// TYPES
// ============================================================================

export interface CodeEditorProps {
  style: StyleDefinition
  onChange: (updates: Partial<StyleDefinition>) => void
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Convert CSSProperty array to CSS string
 */
function propertiesToCSS(selector: string, properties: CSSProperty[]): string {
  if (properties.length === 0) {
    return `${selector} {\n  /* No properties yet */\n}`
  }

  const cssLines = properties.map((prop) => {
    const important = prop.important ? ' !important' : ''
    return `  ${prop.property}: ${prop.value}${important};`
  })

  return `${selector} {\n${cssLines.join('\n')}\n}`
}

/**
 * Parse CSS string to CSSProperty array
 * Simple parser - extracts property: value pairs
 */
function cssToProperties(cssString: string): CSSProperty[] {
  const properties: CSSProperty[] = []

  // Extract content between { }
  const match = cssString.match(/\{([^}]*)\}/)
  if (!match) return properties

  const content = match[1]
  const lines = content.split(';')

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('/*')) continue

    const colonIndex = trimmed.indexOf(':')
    if (colonIndex === -1) continue

    const property = trimmed.substring(0, colonIndex).trim()
    let value = trimmed.substring(colonIndex + 1).trim()

    // Check for !important
    const important = value.includes('!important')
    if (important) {
      value = value.replace(/\s*!important\s*$/, '').trim()
    }

    properties.push({
      property,
      value,
      important,
    })
  }

  return properties
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * CodeEditor - Monaco-based CSS editor
 *
 * Features:
 * - CSS syntax highlighting
 * - CSS validation
 * - Auto-completion
 * - Two-way sync with visual editor
 * - Monaco Editor configuration
 */
export function CodeEditor({ style, onChange }: CodeEditorProps) {
  const [cssCode, setCssCode] = useState('')
  const [isEditorReady, setIsEditorReady] = useState(false)

  // Generate CSS from style properties
  useEffect(() => {
    const css = propertiesToCSS(style.selector, style.properties)
    setCssCode(css)
  }, [style.selector, style.properties])

  // Handle Monaco editor mount
  const handleEditorDidMount = useCallback((_editor: any, monaco: Monaco) => {
    // Configure CSS language features
    monaco.languages.css.cssDefaults.setOptions({
      validate: true,
      lint: {
        compatibleVendorPrefixes: 'warning',
        vendorPrefix: 'warning',
        duplicateProperties: 'warning',
        emptyRules: 'warning',
        importStatement: 'ignore',
        boxModel: 'ignore',
        universalSelector: 'ignore',
        zeroUnits: 'ignore',
        fontFaceProperties: 'warning',
        hexColorLength: 'error',
        argumentsInColorFunction: 'error',
        unknownProperties: 'warning',
        ieHack: 'ignore',
        unknownVendorSpecificProperties: 'ignore',
        propertyIgnoredDueToDisplay: 'warning',
        important: 'ignore',
        float: 'ignore',
        idSelector: 'ignore',
      },
    })

    setIsEditorReady(true)
  }, [])

  // Handle CSS code changes with debounce
  const handleCodeChange = useCallback(
    (value: string | undefined) => {
      if (!value || !isEditorReady) return

      setCssCode(value)

      // Parse CSS and update properties
      try {
        const properties = cssToProperties(value)
        onChange({ properties })
      } catch (error) {
        console.error('Failed to parse CSS:', error)
      }
    },
    [isEditorReady, onChange]
  )

  return (
    <div className="h-full">
      <Editor
        height="100%"
        defaultLanguage="css"
        value={cssCode}
        onChange={handleCodeChange}
        onMount={handleEditorDidMount}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          roundedSelection: true,
          scrollBeyondLastLine: false,
          readOnly: false,
          cursorStyle: 'line',
          automaticLayout: true,
          tabSize: 2,
          insertSpaces: true,
          wordWrap: 'on',
          wrappingIndent: 'indent',
          formatOnPaste: true,
          formatOnType: true,
          suggest: {
            showWords: true,
            showSnippets: true,
          },
          quickSuggestions: {
            other: true,
            comments: false,
            strings: true,
          },
          parameterHints: {
            enabled: true,
          },
          suggestOnTriggerCharacters: true,
          acceptSuggestionOnCommitCharacter: true,
          acceptSuggestionOnEnter: 'on',
          snippetSuggestions: 'top',
        }}
      />
    </div>
  )
}
