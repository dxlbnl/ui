// Component exports — populated as components are built through the backlog
export { Button, Led, TagPill, Text, Heading } from './components/primitives/index.js'
export { Stack, Inline, Spread, Grid, Container, Rule, Prose } from './components/layout/index.js'
export { Card, ProductCard, ProjectCard, NoteCard } from './components/cards/index.js'
export { Nav, Breadcrumb } from './components/navigation/index.js'
/** SegmentedControl: joined radiogroup of mutually-exclusive options with roving tabindex. */
export { Input, Textarea, Select, InputWrap, Field, Checkbox, Radio, RadioGroup, Switch, SegmentedControl } from './components/forms/index.js'
/** StatusPill: coloured status pill that toggles a detail Popover on click. */
export { Alert, Modal, Popover, StatusPill, Toast, ToastRegion } from './components/feedback/index.js'
export { toast } from './stores/toast.js'
export type { ToastItem, ToastVariant, ToastOptions } from './stores/toast.js'
/** Gauge: radial SVG dial rendering a single 0–100 value as an arc, sibling of ProgressBar. */
export { CtaBlock, StatCard, KvList, ProgressBar, ActivityRow, SectionHead, SectionFoot, PageHero, Gauge } from './components/patterns/index.js'
export { Accordion, AccordionItem, Tabs, Table } from './components/data/index.js'
