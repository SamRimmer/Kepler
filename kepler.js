/**
 * Generic thing-in-orbit-around-a-thing class.
 * Has properties to store orbital elements as well as functions to calculate
 *  them from whatever data is available.
 */
function Kepler (rvec, vvec, mass) {
  this.rvec = rvec
  this.vvec = vvec
  this.mass = mass
}

Kepler.prototype = {
  /**
   * Radius scalar
   * Requires:
   *  rvec - Radial position vector
   */
  set_r: function() {
    this.r = this.rvec.length()
    return this
  },

  /**
   * Velocity scalar
   * Requires:
   *  vvec - Velocity vector
   */
  set_v: function() {
    this.v = this.vvec.length()
    return this
  },

  /**
   * Gravitational attraction
   * Requires:
   *  G - Gravitational constant
   *  parentSoI.μ - Mass of whatever this object is orbiting
   */
  set_μ: function() {
    this.μ = 398600
    return this
  },

  /**
   * Kinetic energy
   * Requires:
   *  v - Velocity scalar
   */
  set_ek: function() {
    this.require(['v'])
    this.ek = this.v.square() / 2
    return this
  },

  /**
   * Gravitational potential energy
   * Requires:
   *  μ - Gravitational attraction
   *  r - Radius scalar
   */
  set_ep: function() {
    this.require(['μ', 'r'])
    this.ep = -this.μ / this.r
    return this
  },

  /**
   * Specific orbital energy
   * Requires:
   *  ek - Kinetic energy
   *  ep - Gravitational potential energy
   */
  set_ε: function() {
    this.require(['ek', 'ep'])
    this.ε = this.ek + this.ep
    return this
  },

  /**
   * Moment of inertia
   * Requires:
   *  mass - Mass of this object
   *  r - Radius scalar
   */
  set_I: function() {
    this.require(['r'])
    this.I = this.mass * this.r.square()
    return this
  },

  /**
   * Angular velocity
   * Requires:
   *  rvec - Radial position vector
   *  vvec - Velocity vector
   *  r - Radius scalar
   */
  set_Ω: function() {
    this.require(['r'])
    this.Ω = this.rvec.cross(this.vvec) / this.r.square()
    return this
  },

  /**
   * Total angular momentum
   * Requires:
   *  I - Moment of inertia
   *  Ω - Angular velocity
   */
  set_L: function() {
    this.require(['I', 'Ω'])
    this.L = this.I * this.Ω
    return this
  },

  /**
   * Specific relative angular momentum
   * Requires:
   *  L - Total angular momentum
   *  μ - Gravitational attraction
   */
  set_h: function() {
    this.require(['L', 'μ'])
    this.h = this.L / this.mass
    return this
  },

  /**
   * Semi-major axis - distance from center of orbit to apoapse or periapse -
   *  equal to half of the 'length' of the orbit.
   * Requires:
   *  μ - Gravitational attraction
   *  ε - Specific orbital energy
   */
  set_a: function() {
    this.require(['μ', 'ε'])
    this.a = -this.μ / (2 * this.ε)
    return this
  },

  /**
   * Semi-minor axis - length of the radius perpendicular to the semimajor
   *  axis.  The 'width' of the orbit.
   * Requires:
   *  a - Semi-major axis
   *  ecc - eccentricity scalar
   */
  set_b: function() {
    this.require(['a', 'ecc'])
    if (this.ecc > 1) {
      this.b = this.a * (this.ecc.square() - 1).sqrt()
    } else {
      this.b = this.a * (1 - this.ecc.square()).sqrt()
    }
    return this
  },

  /**
   * Eccentricity vector - an imaginary line from the center of the orbit to
   *  the perifocus
   * Requires:
   *  vvec - Velocity vector
   *  rvec - Radial position vector
   *  μ - Gravitational attraction
   *  r - Radius scalar
   */
  set_eccvec: function() {
    this.eccvec = (this.vvec.cross(this.h).divide(this.μ)).subtract(this.rvec.divide(this.r))
  },

  /**
   * Eccentricity - how squashed the orbital ellipse is or how long it is
   *  relative to its width.  Must be +ve otherwise the universe implodes.
   * Requires:
   *  ε - Specific orbital energy
   *  h - Specific relative angular momentum
   *  μ - Gravitational attraction
   */
  set_ecc: function() {
    this.require(['ε', 'h', 'μ'])
    this.ecc = (1 + (2 * this.ε * this.h.square()) / this.μ.square()).sqrt()
    return this
  },

  /**
   * Orbital period - the duration of the orbit.  I don't know what unit this
   *  will output.  Probably seconds?  Unsure.
   * Requires:
   *  a - Semi-major axis
   *  μ - Gravitational attraction
   */
  set_p: function() {
    this.require(['a', 'μ'])
    this.p = 2 * π * ((this.a.cube()) / this.μ).sqrt()
    return this
  },

  /**
   * Eccentric anomaly - the angle from the center of the orbit to the point
   *  on the imaginary circle around the orbit pointed to by a line
   *  perpendicular from the semi-major axis through the position of the
   *  orbiting object
   * It's E in this diagram:
   *  http://upload.wikimedia.org/wikipedia/commons/e/e1/Eccentric_and_true_anomaly.PNG
   */
  set_Et: function() {
    this.require(['a'])
    this.Et = Math.acos(this.rvec.x / this.a)
    return this
  },

  set_ap: function() {
    this.require(['ecc', 'a'])
    this.ap = (1 + this.ecc) * this.a
  },

  set_pe: function() {
    this.require(['ecc', 'a'])
    this.pe = (1 - this.ecc) * this.a
  },

  /**
   * Argument of periapsis - the angle from some universal reference angle
   *  to the periapsis of this objects orbit
   * Requires:
   *  eccvec - Eccentricity vector
   */
  set_ω: function() {
    this.require(['eccvec'])
    this.ω = Math.atan2(this.eccvec.y, this.eccvec.x)
  },

  /**
   * True anomaly at epoch
   * Basically a reference point, saying where the object was in its orbit
   *  at some reference time.  From this, and the time elapsed since, we can
   *  calculate how far around its current orbit the object is.
   * Requires:
   *  rvec - Velocity vector
   */
  set_vt: function() {
    this.vt = Math.atan2(this.rvec.y, this.rvec.x)
    return this
  },

  /**
   * Calculate eccentric anomaly from mean anomaly
   */
  eccAnom: function() {
    var K = π / 180
    var i = 0
    var E, F
    var maxIter = 30

    this.M = this.Mt + (this.n * (Game.currentTick - this.epoch))

    this.M = 2.0 * π * (this.M - Math.floor(this.M))

    if (this.ε < 0.8) {
      E = this.M
    } else {
      E = π
    }

    F = E - this.ε * Math.sin(this.M) - this.M

    while (F.abs() > 0.001 && i < maxIter) {
      E = E - F / (1.0 - this.ε * Math.cos(E))
      F = E - this.ε * Math.sin(E) - this.M
      i = i + 1;
    }

    this.E = E / K
  },

  /**
   * Calculate true anomaly from eccentric anomaly
   */
  TrueAnom: function() {
    var S = Math.sin(this.E)
    var C = Math.cos(this.E)

    var fak = (1.0 - this.ε * this.ε).sqrt()
    this.φ = Math.atan2(fak * S, C - this.ε) / π
  },

  /**
   * Calculate position from true anomaly
   */
  position: function() {
    var C = Math.cos(this.E)
    var S = Math.sin(this.E)
  },

  /**
   * Require function, takes a list of properties which are required to
   *  calculate any step and checks whether there is a valid value saved,
   *  otherwise it calculates it.
   */
  require: function(properties) {
    for (var j in properties) {
      if (typeof this[properties[j]] == 'undefined') {
        this['set_' + properties[j]]()
      }
    }
  },
}