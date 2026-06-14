// Component exports — populated as components are built through the backlog
export { Button, Led, TagPill, Text, Heading } from './components/primitives/index.js'
export { Stack, Inline, Spread, Grid, Container, Rule, Prose } from './components/layout/index.js'
export { Card, ProductCard, ProjectCard, NoteCard } from './components/cards/index.js'
/** Pager: controlled prev / label / next stepper for paging through result windows. */
export { Nav, Breadcrumb, Pager } from './components/navigation/index.js'
/** SegmentedControl: joined radiogroup of mutually-exclusive options with roving tabindex. */
export { Input, Textarea, Select, InputWrap, Field, Checkbox, Radio, RadioGroup, Switch, SegmentedControl } from './components/forms/index.js'
/** StatusPill: coloured status pill that toggles a detail Popover on click. */
/** Inbox: bell button with unread badge that toggles a Popover list of notifications. */
export { Alert, Modal, Popover, StatusPill, Inbox, Toast, ToastRegion } from './components/feedback/index.js'
export { toast } from './stores/toast.js'
export type { ToastItem, ToastVariant, ToastOptions } from './stores/toast.js'
/** ProportionBar: horizontal stacked share bar (part-to-whole) with a legend, sibling of Gauge. */
/** CompareBars: stacked target-vs-actual rows, danger/ok fill when value over/within target. */
export { CtaBlock, StatCard, KvList, ProgressBar, ActivityRow, SectionHead, SectionFoot, PageHero, Gauge, ProportionBar, CompareBars } from './components/patterns/index.js'
export { Accordion, AccordionItem, Tabs, Table } from './components/data/index.js'
