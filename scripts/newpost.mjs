import fs from 'fs'
import path from 'path'
import inquirer from 'inquirer'
import chalk from 'chalk'
import open from 'open'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

// Handle paths relative to the script directory
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const postDirectory = path.join(__dirname, '../data/blog')

const questions = [
  {
    type: 'input',
    name: 'title',
    message: 'Enter the post title:',
    validate: (input) => (input ? true : 'Title is required'),
  },
  {
    type: 'input',
    name: 'date',
    message: `Enter the post date (YYYY-MM-DD): ${chalk.gray('(default: today)')}`,
    default: new Date().toISOString().split('T')[0],
    validate: (input) =>
      /\d{4}-\d{2}-\d{2}/.test(input) ? true : 'Date must be in YYYY-MM-DD format',
    filter: (input) => (input.trim() === '' ? new Date().toISOString().split('T')[0] : input),
  },
  {
    type: 'input',
    name: 'lastmod',
    message: `Enter the last modified date (YYYY-MM-DD): ${chalk.gray('(default: today)')}`,
    default: new Date().toISOString().split('T')[0],
    validate: (input) =>
      /\d{4}-\d{2}-\d{2}/.test(input) ? true : 'Date must be in YYYY-MM-DD format',
    filter: (input) => (input.trim() === '' ? new Date().toISOString().split('T')[0] : input),
  },
  {
    type: 'input',
    name: 'tags',
    message: 'Enter tags (comma-separated):',
  },
  {
    type: 'confirm',
    name: 'draft',
    message: 'Is this a draft?',
    default: false,
  },
  {
    type: 'input',
    name: 'summary',
    message: 'Enter a summary:',
  },
  {
    type: 'input',
    name: 'images',
    message: 'Enter image paths (comma-separated):',
  },
  {
    type: 'input',
    name: 'authors',
    message: `Enter authors (comma-separated): ${chalk.gray('(default: default)')}`,
    default: 'default',
    filter: (input) => (input.trim() === '' ? 'default' : input),
  },
  {
    type: 'list',
    name: 'layout',
    message: 'Select a layout:',
    choices: ['PostLayout', 'PostSimple', 'PostBanner'],
    default: 'PostLayout',
  },
  {
    type: 'input',
    name: 'canonicalUrl',
    message: 'Enter canonical URL (optional):',
  },
]

const args = process.argv.slice(2)
let editorCommand = args[0] || ''

// If no command-line argument is provided, try to detect the editor
if (!editorCommand) {
  if (process.env.VSCODE_PID) {
    editorCommand = 'code'
  } else if (process.env.SUBLIME_TEXT_PID) {
    editorCommand = 'subl'
  } else if (process.env.ZED_PID) {
    editorCommand = 'zed'
  } else {
    // Default to VSCode if no environment variable is found
    editorCommand = 'code'
  }
}

inquirer.prompt(questions).then((answers) => {
  const { title, date, lastmod, tags, draft, summary, images, authors, layout, canonicalUrl } =
    answers

  // Create a directory for the date if it doesn't exist
  const dateDir = path.join(postDirectory, date)
  if (!fs.existsSync(dateDir)) {
    fs.mkdirSync(dateDir, { recursive: true })
  }

  // Sanitize the title to create a valid filename
  const sanitizedTitle = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  const postFileName = `${date}-${sanitizedTitle}.mdx`
  const postFilePath = path.join(dateDir, postFileName)

  // Generate the frontmatter
  let frontmatter = `---
title: '${title}'
date: '${date}'
lastmod: '${lastmod}'
draft: ${draft}
layout: ${layout}
`

  if (tags)
    frontmatter += `tags: [${tags
      .split(',')
      .map((tag) => `'${tag.trim()}'`)
      .join(', ')}]\n`
  if (summary) frontmatter += `summary: '${summary}'\n`
  if (images)
    frontmatter += `images: [${images
      .split(',')
      .map((image) => `'${image.trim()}'`)
      .join(', ')}]\n`
  if (authors)
    frontmatter += `authors: [${authors
      .split(',')
      .map((author) => `'${author.trim()}'`)
      .join(', ')}]\n`
  if (canonicalUrl) frontmatter += `canonicalUrl: ${canonicalUrl}\n`

  frontmatter += `---
`

  // Write the post file
  fs.writeFileSync(postFilePath, frontmatter)

  console.log(chalk.green('Create Post Succeed.'))
  console.log(chalk.blue(`Open the file ${postFilePath} to write your blog now.`))

  // Open the created file using the determined editor
  open(postFilePath, { app: { name: editorCommand } }).catch((err) => {
    console.error(chalk.red(`Failed to open the file: ${err.message}`))
  })
})
