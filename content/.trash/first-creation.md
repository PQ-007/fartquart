---
title: Room for Me
description: A personal site built with Next.js 16, WebGL GLSL shaders, and an Obsidian-style D3.js tag graph.
tags: [nextjs, typescript, webgl, d3, design]
date: 2026-06-01
repo: https://github.com/bilguuntushig/room-for-me
draft: false
---

## Overview

This site is itself a project. I wanted a space that felt mine — not a template, but something built from scratch with the things I care about.

## Stack

Next.js 16 App Router, TypeScript, CSS Modules. Content lives in an Obsidian vault and gets parsed at build time with gray-matter and next-mdx-remote.

## Background

The animated background is a WebGL GLSL fragment shader — three organic blob shapes driven by sinusoidal functions. It adapts between dark and light modes: deep ocean blues in dark mode, soft near-white with a subtle grid in light mode.

## Tag Graph

The `/tags` page renders an Obsidian-style knowledge graph using D3.js on a Canvas element. Blog posts, creations, and tags are nodes. Edges connect content to the tags they carry. Hub nodes (Blog, Creations) anchor the center ring, content nodes orbit them, and tag nodes fill the outer ring. Fully interactive — drag, pan, zoom, click to navigate.

## Content Pipeline

Dropping a `.md` file into the vault is enough. The parser reads frontmatter, builds listing pages, generates static routes, and wires everything into the tag graph automatically. Obsidian folder notes are supported — a note inside a folder with attachments maps cleanly to `/blog/folder-name`.

## i18n

Three languages: English, Mongolian (Cyrillic), Japanese. The language switcher lives in the nav pill and persists to localStorage. Mongolian uses Manrope's Cyrillic subset; Japanese falls back to Noto Sans JP via Google Fonts.
