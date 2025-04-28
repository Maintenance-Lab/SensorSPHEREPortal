import { RenderTree } from "./types";

export const loadRows = async (properties: any, setAllProperties: any) => {
  const root: RenderTree = {
    id: "root",
    name: "All Properties",
    children: {}
  };

  for (const entry of properties) {
    const { moduleManufacturer, moduleName, sensorType, propertyName, _} = entry;
    const moduleKey = `${moduleManufacturer}:${moduleName}`;
    const moduleDisplay = `${moduleManufacturer} ${moduleName}`;

    if (!root.children![moduleKey]) {
      root.children![moduleKey] = {
        id: moduleKey,
        name: moduleDisplay,
        children: {}
      };
    }

    if (!root.children![moduleKey].children![sensorType]) {
      root.children![moduleKey].children![sensorType] = {
        id: `${moduleKey}:${sensorType}`,
        name: sensorType,
        children: {}
      };
    }

    root.children![moduleKey].children![sensorType].children![propertyName] = {
      id: `${moduleKey}:${sensorType}:${propertyName}`,
      name: propertyName
    };
  }

  setAllProperties(root);
  return root;
};

const getAllChild = (nodes: RenderTree | null): string[] => {
    if (!nodes) return [];

    let array = [nodes.id];
    // Recursively get all children
    if (nodes.children && typeof nodes.children === "object") {
    Object.values(nodes.children).forEach((child) => {
        array = [...array, ...getAllChild(child)];
    });
    }

    // Remove duplicates
    return [...new Set(array)];
};

const findParent = (nodeId: string, nodes: RenderTree): RenderTree | null => {
    if (!nodes || !nodes.children) return null;

    for (const key in nodes.children) {
        if (nodes.children[key].id === nodeId) {
        return nodes;
        }
        const found = findParent(nodeId, nodes.children[key]);
        if (found) return found;
    }
    return null;
};

const areAllChildrenSelected = (parent: RenderTree, selectedSet: Set<string>): boolean => {
    if (!parent.children) return false;
    return Object.values(parent.children).every(child => selectedSet.has(child.id));
};

export const getOnChange = async (checked: boolean, nodes: RenderTree, allProperties: RenderTree, setSelectedProperties: any) => {
    const allNodeIds = getAllChild(nodes);

    setSelectedProperties((prevSelected) => {
    let newSelection: Set<string> = new Set(prevSelected);

    if (checked) {
        // Selecting node: Add itself and all its children
        allNodeIds.forEach((id) => newSelection.add(id));

        // Check and update parent nodes recursively
        let parent = findParent(nodes.id, allProperties);
        while (parent) {
        if (areAllChildrenSelected(parent, newSelection)) {
            newSelection.add(parent.id);
        }
        parent = findParent(parent.id, allProperties);
        }
    } else {
        // Deselecting node: Remove itself and all children
        allNodeIds.forEach((id) => newSelection.delete(id));

        // Also deselect parent if necessary
        let parent = findParent(nodes.id, allProperties);
        while (parent) {
        if (!areAllChildrenSelected(parent, newSelection)) {
            newSelection.delete(parent.id);
        }
        parent = findParent(parent.id, allProperties);
        }
    }

    return [...newSelection];
    });
};

export const updateSelection = (selectedIds: string[], allProperties: RenderTree) => {
    const newSelection = [...selectedIds];

    const checkAndSelectParent = (node: RenderTree) => {
      if (!node || !node.children) return;

      Object.values(node.children).forEach((child) => {
        checkAndSelectParent(child);

        if (!child?.children) return;

        // Check if all children of this node are selected
        const allChildrenSelected = Object.values(child.children).every((c) =>
          newSelection.includes(c.id)
        );

        if (allChildrenSelected && !newSelection.includes(child.id)) {
          newSelection.push(child.id);
        }
      });
    };

    checkAndSelectParent(allProperties);

    const allRootChildrenSelected = Object.values(allProperties.children || {}).every((child) =>
      newSelection.includes(child.id)
    );

    if (allRootChildrenSelected && !newSelection.includes(allProperties.id)) {
      newSelection.push(allProperties.id);
    }

    return newSelection;
};


// TODO:
// 1. Fix selected properties,
//    API stuurt goede properties
//    updateSelection doet het niet goed
//    handleSelectedProperties heeft drm niet goede waarden
// 2. Fix selected properties in treeview
// 3. Bij back vanaf stap 2 bij configure gaat hij nog een x naar 2

// Properties nu goed geladen
//  - Checken of deselecteren ook werkt
//  - Goede selected properties laden
//  -
//  - Null error frequency weghalen



