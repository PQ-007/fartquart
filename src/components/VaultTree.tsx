"use client"

import { useState, type ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, Folder, FolderOpen, FileText } from "lucide-react"
import type { VaultTreeGroup, VaultTreeNode } from "@/lib/content"
import { useT } from "./LanguageProvider"
import styles from "./VaultTree.module.css"

const GROUP_LABEL_KEY: Record<string, string> = {
  "hub:blog": "nav.blog",
  "hub:notes": "nav.notes",
  "hub:creations": "nav.creations",
}

const Row = ({
  depth,
  label,
  href,
  active,
  expandable,
  expanded,
  onToggle,
  icon,
}: {
  depth: number
  label: string
  href: string
  active: boolean
  expandable: boolean
  expanded: boolean
  onToggle: () => void
  icon: ReactNode
}) => (
  <div className={styles.row} style={{ paddingLeft: 8 + depth * 16 }} data-active={active}>
    {expandable ? (
      <button
        type="button"
        className={styles.chevronBtn}
        onClick={onToggle}
        aria-label={expanded ? "Collapse" : "Expand"}
        aria-expanded={expanded}
      >
        <ChevronRight className={styles.chevron} data-expanded={expanded} size={13} />
      </button>
    ) : (
      <span className={styles.chevronSpacer} />
    )}
    {icon}
    <Link href={href} className={styles.rowLink} title={label}>
      {label}
    </Link>
  </div>
)

const TreeNode = ({
  node,
  depth,
  pathname,
}: {
  node: VaultTreeNode
  depth: number
  pathname: string
}) => {
  const [expanded, setExpanded] = useState(false)
  const hasChildren = Boolean(node.children?.length)

  return (
    <>
      <Row
        depth={depth}
        label={node.title}
        href={node.href}
        active={pathname === node.href}
        expandable={hasChildren}
        expanded={expanded}
        onToggle={() => setExpanded((e) => !e)}
        icon={<FileText size={13} className={styles.fileIcon} />}
      />
      {hasChildren && expanded && (
        <div>
          {node.children!.map((child) => (
            <TreeNode key={child.id} node={child} depth={depth + 1} pathname={pathname} />
          ))}
        </div>
      )}
    </>
  )
}

/** Obsidian-style file explorer sidebar: the site's own Blog/Notes/Creations
 * sections as collapsible folders, chapters nested under their parent doc. */
export const VaultTree = ({ tree }: { tree: VaultTreeGroup[] }) => {
  const t = useT()
  const pathname = usePathname()
  const [openGroups, setOpenGroups] = useState<Set<string>>(() => new Set(tree.map((g) => g.id)))

  const toggleGroup = (id: string) =>
    setOpenGroups((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  return (
    <nav className={styles.tree} aria-label={t("graph.vault")}>
      <p className={styles.heading}>{t("graph.vault")}</p>
      <div className={styles.scroll}>
        {tree.map((group) => {
          const expanded = openGroups.has(group.id)
          return (
            <div key={group.id}>
              <Row
                depth={0}
                label={t(GROUP_LABEL_KEY[group.id] ?? "nav.home")}
                href={group.href}
                active={pathname === group.href}
                expandable={group.children.length > 0}
                expanded={expanded}
                onToggle={() => toggleGroup(group.id)}
                icon={
                  expanded ? (
                    <FolderOpen size={13} className={styles.folderIcon} />
                  ) : (
                    <Folder size={13} className={styles.folderIcon} />
                  )
                }
              />
              {expanded &&
                group.children.map((node) => (
                  <TreeNode key={node.id} node={node} depth={1} pathname={pathname} />
                ))}
            </div>
          )
        })}
      </div>
    </nav>
  )
}
