
export interface RenderTree {
    id: string;
    name: string;
    children?: { [key: string]: RenderTree };
};

