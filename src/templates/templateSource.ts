import inThisFolder from './components/filter/inThisFolder.yaml';
import isTask from './components/filter/isTask.yaml';
import notTemplate from './components/filter/notTemplate.yaml';
import pastWeek from './components/filter/pastWeek.yaml';
import category from './components/formula/category.yaml';
import color from './components/formula/color.yaml';
import effort from './components/formula/effort.yaml';
import links from './components/formula/links.yaml';
import resolved from './components/formula/resolved.yaml';
import taskProperties from './components/propertyDisplay/taskProperties.yaml';
import due from './components/view/due.yaml';
import focused from './components/view/focused.yaml';
import resolvedView from './components/view/resolved.yaml';
import unresolved from './components/view/unresolved.yaml';
import dashboard from './bases/dashboard.yaml';

export function registerTemplateSource(): void {
  window.programmaticBases.registerSource({
    name: 'task-base',
    components: {
      'filter/inThisFolder': inThisFolder,
      'filter/isTask': isTask,
      'filter/notTemplate': notTemplate,
      'filter/pastWeek': pastWeek,
      'formula/category': category,
      'formula/color': color,
      'formula/effort': effort,
      'formula/links': links,
      'formula/resolved': resolved,
      'propertyDisplay/taskProperties': taskProperties,
      'view/due': due,
      'view/focused': focused,
      'view/resolved': resolvedView,
      'view/unresolved': unresolved,
    },
    templates: {
      'dashboard': dashboard,
    },
  });
}
