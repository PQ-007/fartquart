---
title: Өгөгдлийн бүтэц — Array, LinkedList, Tree, Graph
description: Програмчлалын үндсэн өгөгдлийн бүтцүүдийн ажиллах зарчим, цаг хугацааны нарийн задлал.
label: lesson-note
date: 2025-05-18
tags:
  - DataStructures
  - Algorithm
  - ComputerScience
draft: false
---

## Array

Санах ойд дараалсан байрлалтай, нэг төрлийн элементүүдийн цуглуулга. Индекс ашиглан O(1) хандалт боломжтой.

**Давуу тал:** Хурдан random access, cache-friendly.
**Сул тал:** Дунд элемент нэмэх/устгахад O(n) — бусад элементийг шилжүүлэх шаардлагатай.

## Linked List

Элемент бүр дараагийн элементийн заалтыг агуулсан зангилааны дараалал.

**Singly Linked List** — зөвхөн урагш чиглэсэн заалт.
**Doubly Linked List** — урагш болон ухрах чиглэл хоёулаа.

Дунд оруулах/устгах O(1) — харин хандалт O(n).

## Stack ба Queue

**Stack** (LIFO) — функцийн дуудалтын стек, undo/redo, expression evaluation.
**Queue** (FIFO) — даалгаврын дараалал, BFS алгоритм, message queue.

## Binary Search Tree

Шатлан зохиогдсон бүтэц: зүүн дэд мод нь жижиг, баруун нь том утгуудыг агуулдаг.

- Хайх: O(log n) дундажаар, O(n) хамгийн муу тохиолдол
- Balanced BST (AVL, Red-Black): O(log n) баталгаатай

## Hash Table

Түлхүүрийг hash function-ээр байрлал болгон хувиргадаг бүтэц.

Хандалт, нэмэлт, устгал дундажаар O(1). Collision шийдвэрлэх арга: separate chaining, open addressing.

## Graph

Оройнуудыг (vertices) ирмэгүүдээр (edges) холбосон бүтэц. Чиглэлтэй болон чиглэлгүй байж болно.

**Хадгалалт:** Adjacency matrix O(V²), Adjacency list O(V+E).
**Алгоритм:** BFS, DFS, Dijkstra, Bellman-Ford, топологи эрэмбэ.
