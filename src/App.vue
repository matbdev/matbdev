<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { ArrowUpRight } from 'lucide-vue-next'
import HeroSection from './components/hero/HeroSection.vue'
import SkillsSection from './components/skills/SkillsSection.vue'
import ProjectsSection from './components/projects/ProjectsSection.vue'
import ExperienceSection from './components/experience/ExperienceSection.vue'
import EducationSection from './components/education/EducationSection.vue'
import ResumeSection from './components/resume/ResumeSection.vue'
import SiteFooter from './components/footer/SiteFooter.vue'
import SiteHeader from './components/header/SiteHeader.vue'
import { initLocale, localizedNavigation } from './state/locale'

onMounted(() => {
  initLocale()
})

const menuOptions = computed(() => {
  return localizedNavigation.value.map((item) => ({
    label: item.label,
    href: item.href,
    highlighted: item.highlighted,
    icon: item.highlighted ? ArrowUpRight : undefined,
  }))
})
</script>

<template>
  <div class="header-rail">
    <SiteHeader :menu-options="menuOptions" />
  </div>

  <main id="main">
    <HeroSection />
    <SkillsSection />
    <ProjectsSection />
    <ExperienceSection />
    <EducationSection />
    <ResumeSection />
  </main>

  <SiteFooter />
</template>

<style scoped lang="scss">
.header-rail {
  position: sticky;
  top: $space-6;
  z-index: 50;
  height: 0;
  overflow: visible;
  pointer-events: none;

  :deep(.header__container) {
    position: relative;
    top: 0;
    pointer-events: auto;
  }

  @media (max-width: 640px) {
    top: $space-3;
  }
}
</style>
