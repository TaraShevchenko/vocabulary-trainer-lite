# Task: Hide/Show Learned Groups Feature

## Overview

Добавлена функциональность скрытия/показа выученных групп слов в компоненте GroupsList.

## Scope

- **Complexity**: Level 2 (Simple Enhancement)
- **Status**: ✅ Completed
- **Date**: 2024

## Implementation Summary

### Backend Changes

- **File**: `src/modules/groups/model/router.groups.ts`
- Добавлен параметр `hideLearned: boolean` с default `true`
- Реализована фильтрация групп с `averageProgress === 100`

### Frontend Changes

- **File**: `src/modules/groups/ui/GroupsList.tsx`
- Добавлен toggle button с иконками Eye/EyeOff
- Локальное состояние `hideLearned`
- Responsive дизайн кнопки

## User Experience

- По умолчанию выученные группы скрыты
- Кнопка "Show learned"/"Hide learned" для переключения
- Визуальные индикаторы состояния фильтра

## Technical Details

- API обратно совместимо (default: true)
- React state управление с немедленным обновлением API
- Стандартные UI паттерны shadcn/ui

## Testing

Ready for user testing - feature fully implemented and functional.
