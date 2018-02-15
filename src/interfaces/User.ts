export interface User {
    _username: string;
    _name: string;
    _email: string;
    _organization: string;
    _pwd: string;
    _objects: LearningObject[];
    
    addObject(): LearningObject;
    removeObject(i: number): LearningObject;
}