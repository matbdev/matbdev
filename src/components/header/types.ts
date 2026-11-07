import type { Component } from 'vue'

export interface MenuOptionsProps {
  label: string
  href: string
  highlighted?: boolean
  icon?: Component
}
