/*
 * Copyright 2015 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */


/**
 * Applies the final state of the passed animation as inline CSS properties.
 * This can apply to a single target (if specified, or as part of a
 * KeyframeEffect) or many (if a sequence is specified).
 *
 * Due to the limitations of some browsers, the final state will be applied
 * using rAF (it won't be immediately visible when this function returns).
 *
 * @param {!Array<*>|!AnimationEffectReadOnly} anim to parse, not cloned
 * @param {!Element=} opt_target required if not inferred from anim
 */
function AnimationUtilApply(anim, opt_target) {
	var me = arguments.callee;
  if (anim.children && anim.children.length !== undefined) {
		anim.children.forEach(function(each) {
      me(each, opt_target);
    });
		return;
  }

  var target = opt_target || null;

  // Check for KeyframeEffect, which has a target.
  if (anim.target !== undefined) {
    if (target && anim.target != target) {
      return;  // can't apply to this target, not selected
    }
    target = anim.target;
    anim = anim.getFrames();
  }

  if (anim instanceof Function) {
    throw new Error(me.name + ' does not support EffectCallback syntax');
  } else if (anim.length === undefined) {
    throw new Error(me.name + ' expected Array or effect');
  } else if (!target) {
    throw new Error(me.name + ' can\'t resolve target');
  } else if (!anim.length) {
    return;  // unusual, but valid - no keyframes
  }

  var last = anim[anim.length - 1];

	// NOTE: This works around bad implementations of requestAnimationFrame in
	// many browsers. The spec says that rAF must be called before any layout
	// or style recalc is done; however, as of Oct 2015, Safari, Firefox (among
	// others) will sometimes layout before this.
 	window.requestAnimationFrame(function() {
    var s = target.style;
    for (var x in last) {
      s[x] = last[x];
    }
	});
}

window["AnimationUtilApply"] = AnimationUtilApply;
