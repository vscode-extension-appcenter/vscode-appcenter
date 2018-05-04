/*
 * Code generated by Microsoft (R) AutoRest Code Generator.
 * Changes may cause incorrect behavior and will be lost if the code is
 * regenerated.
 */

'use strict';

/**
 * VSTS user profile
 *
 */
class VSTSProfile {
  /**
   * Create a VSTSProfile.
   * @member {string} [id] Profile id
   * @member {string} [displayName] Profile display name
   * @member {string} [publicAlias] Profile alias
   * @member {string} [emailAddress] Profile email
   */
  constructor() {
  }

  /**
   * Defines the metadata of VSTSProfile
   *
   * @returns {object} metadata of VSTSProfile
   *
   */
  mapper() {
    return {
      required: false,
      serializedName: 'VSTSProfile',
      type: {
        name: 'Composite',
        className: 'VSTSProfile',
        modelProperties: {
          id: {
            required: false,
            serializedName: 'id',
            type: {
              name: 'String'
            }
          },
          displayName: {
            required: false,
            serializedName: 'displayName',
            type: {
              name: 'String'
            }
          },
          publicAlias: {
            required: false,
            serializedName: 'publicAlias',
            type: {
              name: 'String'
            }
          },
          emailAddress: {
            required: false,
            serializedName: 'emailAddress',
            type: {
              name: 'String'
            }
          }
        }
      }
    };
  }
}

module.exports = VSTSProfile;