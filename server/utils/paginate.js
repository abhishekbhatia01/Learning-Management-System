export const paginate = async (Model, query, options) => {
  const page = parseInt(options.page, 10) || 1;
  const limit = parseInt(options.limit, 10) || 12;
  const offset = (page - 1) * limit;

  let order = [["createdAt", "DESC"]];
  if (options.sort) {
    const keys = Object.keys(options.sort);
    if (keys.length > 0) {
      order = keys.map((k) => [k, options.sort[k] === -1 ? "DESC" : "ASC"]);
    }
  }

  let attributes = undefined;
  if (options.select) {
    if (typeof options.select === "string") {
      const parts = options.select.split(" ").filter(Boolean);
      const excludes = parts
        .filter((p) => p.startsWith("-"))
        .map((p) => p.substring(1));
      const includes = parts.filter((p) => !p.startsWith("-"));
      if (excludes.length > 0) {
        attributes = { exclude: excludes };
      } else if (includes.length > 0) {
        attributes = includes;
      }
    }
  }

  // Dynamic mapping of populate -> include using Sequelize associations
  let include = undefined;
  if (options.populate) {
    const populateArray = Array.isArray(options.populate)
      ? options.populate
      : [options.populate];
    include = populateArray
      .map((p) => buildInclude(p, Model))
      .filter(Boolean);
  }

  // Run count and findAll separately to avoid Sequelize's nested-include
  // validation bug in the internal count subquery of findAndCountAll.
  const [totalCount, result] = await Promise.all([
    Model.count({ where: query }),
    Model.findAll({
      where: query,
      order,
      limit,
      offset,
      attributes,
      include,
    }),
  ]);

  return {
    result,
    pagination: {
      total: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
      hasNextPage: page * limit < totalCount,
      hasPrevPage: page > 1,
    },
  };
};

/**
 * Recursively build a Sequelize include object from a Mongoose-style populate spec.
 * @param {string|object} p - populate entry: string path or { path, select, populate }
 * @param {object} ParentModel - the Sequelize model whose associations we look in
 */
function buildInclude(p, ParentModel) {
  const path = typeof p === "string" ? p : p.path;

  // Look up the association on the parent model
  const association = ParentModel.associations?.[path];
  if (!association) return null;

  const TargetModel = association.target;

  // Build optional attribute list from Mongoose-style select string
  let selectAttrs = undefined;
  if (p && typeof p === "object" && p.select) {
    const parts = p.select.split(" ").filter(Boolean);
    const excludes = parts.filter((s) => s.startsWith("-")).map((s) => s.substring(1));
    const includes = parts.filter((s) => !s.startsWith("-"));
    if (excludes.length > 0) {
      selectAttrs = { exclude: excludes };
    } else if (includes.length > 0) {
      selectAttrs = includes;
    }
  }

  // Recursively resolve nested populates
  let nestedInclude = undefined;
  if (p && typeof p === "object" && p.populate) {
    const nestedArray = Array.isArray(p.populate) ? p.populate : [p.populate];
    nestedInclude = nestedArray
      .map((nested) => buildInclude(nested, TargetModel))
      .filter(Boolean);
  }

  return {
    model: TargetModel,
    as: path,
    ...(selectAttrs !== undefined && { attributes: selectAttrs }),
    ...(nestedInclude !== undefined && { include: nestedInclude }),
  };
}
