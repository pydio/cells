/*
 * Copyright 2007-2017 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
 * This file is part of Pydio.
 *
 * Pydio is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Pydio is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Pydio.  If not, see <http://www.gnu.org/licenses/>.
 *
 * The latest code can be found at <https://pydio.com>.
 */

import { spring } from 'react-motion';

const properties = [
  { name: 'translateX', unit: 'length' },
  { name: 'translateY', unit: 'length' },
  { name: 'perspective', unit: 'length' },
  { name: 'translateZ', unit: 'length' },
  { name: 'skew', unit: 'angle' },
  { name: 'skewX', unit: 'angle' },
  { name: 'skewY', unit: 'angle' },
  { name: 'scale' },
  { name: 'scaleX' },
  { name: 'scaleY' },
  { name: 'scaleZ' },
  { name: 'rotate', unit: 'angle' },
  { name: 'rotateX', unit: 'angle' },
  { name: 'rotateY', unit: 'angle' }
];

export const positionToProperties = position => ({
  translateX: position[0],
  translateY: position[1]
});

export const buildTransform = (style, units) => {
  const arr = [];

  properties.forEach((prop) => {
    if (typeof style[prop.name] !== 'undefined') {
      const val = isNaN(style[prop.name]) ? 0 : style[prop.name];
      arr.push(`${prop.name}(${val}${prop.unit ? units[prop.unit] : ''})`);
    }
  });

  return arr.join(' ');
};

export const springify = (style, springConfig) => {
    return Object.keys(style).reduce((obj, key) => {
        obj[key] = spring(style[key], springConfig);
        return obj;
    }, {});
};
