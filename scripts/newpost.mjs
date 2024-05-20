import fs from 'fs'
import path from 'path'
import { spawn } from 'child_process'
import inquirer from 'inquirer'
import chalk from 'chalk'
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
    message: 'Enter the post date (YYYY-MM-DD):',
    default: new Date().toISOString().split('T')[0],
    validate: (input) =>
      /\d{4}-\d{2}-\d{2}/.test(input) ? true : 'Date must be in YYYY-MM-DD format',
  },
  {
    type: 'input',
    name: 'lastmod',
    message: 'Enter the last modified date (YYYY-MM-DD):',
    default: new Date().toISOString().split('T')[0],
    validate: (input) =>
      /\d{4}-\d{2}-\d{2}/.test(input) ? true : 'Date must be in YYYY-MM-DD format',
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
    message: 'Enter authors (comma-separated):',
    default: 'default',
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

inquirer.prompt(questions).then((answers) => {
  const { title, date, lastmod, tags, draft, summary, images, authors, layout, canonicalUrl } =
    answers

  // Create a directory for the date if it doesn't exist
  const dateDir = path.join(postDirectory, date)
  if (!fs.existsSync(dateDir)) {
    fs.mkdirSync(dateDir, { recursive: true })
  }

  const frontmatter = `---
title: '${title}'
date: '${date}'
lastmod: '${lastmod}'
tags: [${tags
    .split(',')
    .map((tag) => `'${tag.trim()}'`)
    .join(', ')}]
draft: ${draft}
summary: '${summary}'
images: [${images
    .split(',')
    .map((image) => `'${image.trim()}'`)
    .join(', ')}]
authors: [${authors
    .split(',')
    .map((author) => `'${author.trim()}'`)
    .join(', ')}]
layout: ${layout}
${canonicalUrl ? `canonicalUrl: ${canonicalUrl}` : ''}
---
`

  const postFileName = `${title.toLowerCase().replace(/ /g, '-')}.mdx`
  const postFilePath = path.join(dateDir, postFileName)

  fs.writeFileSync(postFilePath, frontmatter)

  console.log(chalk.green('Create Post Succeed.'))
  console.log(chalk.blue(`Open the file ${postFilePath} to write your blog now.`))

  // Open the created file using appropriate command based on the platform
  if (process.platform === 'win32') {
    spawn('cmd', ['/c', 'start', postFilePath])
  } else if (process.platform === 'darwin') {
    spawn('open', [postFilePath])
  } else if (['linux', 'freebsd'].includes(process.platform)) {
    spawn('xdg-open', [postFilePath])
  }
})
