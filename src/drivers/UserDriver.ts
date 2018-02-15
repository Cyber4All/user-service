/**
 * Provide an abstract representation for a CLARK user.
 */

import {
    LearningObject
} from '@cyber4all/clark-entity';

/**
 * A class to represent CLARK users.
 * @class
 */
export declare class User {
    private _username;
    /**
     * @property {string} id a user's unique log-in username
     */
    username: string;
    private _name;
    /**
     * @property {string} name a user's real-life name
     */
    name: string;
    private _email;
    /**
     * @property {string} email a user's email on file
     */
    email: string;
    private _organization;
    /**
     * @property {string} organization a user's associate organization
     */
    organization: string;
    private _pwd;
    /**
     * @property {string} pwd a user's password authentication
     */
    pwd: string;
    private _objects;

    /**
     * Construct a new User, given starting user id and name.
     * @param {string} username the user's unique log-in username
     * @param {string} name the user's real-life name
     *
     * @constructor
     */
    constructor(username: string, name: string, email: string, organization: string, pwd: string);

    /**
     * @property {LearningObject[]} objects (immutable)
     *       an array of a user's learning objects
     *
     * NOTE: individual elements are freely accessible, but the array
     *       reference itself is immutable, and elements can only be
     *       added and removed by the below functions
     */
    readonly objects: LearningObject[];

    /**
     * Adds a new, blank learning object to this user.
     * @returns {LearningObject} a reference to the new learning object
     */
    addObject(): LearningObject;
    /**
     * Removes the user's i-th learning object.
     * @param {number} i the index to remove from the objects array
     *
     * @returns {LearningObject} the learning object which was removed
     */
    removeObject(i: number): LearningObject;

    /* TODO - applicable here?
    static serialize: (entity: User) => string;

    static unserialize: (msg: string) => User;
    */
}