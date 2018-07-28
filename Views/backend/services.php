<a href="<?= @$data['base_path']; ?>/backend" class="button">Users</a>
<a href="<?= @$data['base_path']; ?>/backend/services" class="button">Services</a>

<fieldset>
    <legend>Service:</legend>
    <form action="<?= @$data['base_path']; ?>/backend/addService" method="post" enctype="multipart/form-data">
        <div class="register-form--field">
            <input placeholder="Name" type="text" id="name" name="_name" required>
        </div>
        <div class="register-form--field">
            <input placeholder="URL" type="text" id="url" name="_url" required>
        </div>
        <div class="register-form--field">
            <input placeholder="Priority" type="number" id="priority" name="_priority">
        </div>
        <div class="register-form--field">
            <label for="image">Icon</label>
            <input type="file" id="image" name="_image">
        </div>
        <div class="register-form--field">
            <button type="submit">Add</button>
        </div>
    </form>
</fieldset>

<table>
    <thead>
    <tr>
        <td>Icon</td>
        <td>Name</td>
        <td>URL</td>
        <td>Priority</td>
        <td></td>
    </tr>
    </thead>
    <tbody>
    <?php /** @var \Golli\Models\Service $service */ foreach (@$data['services'] as $service): ?>
        <tr>
            <td>
                <span class="service-icon">
                    <?php if(!empty($service->getImage())): ?>
                        <img class="icon" src="<?= @$data['base_path']; ?><?= $service->getImage() ?>" alt="<?= $service->getName() ?>">
                    <?php endif; ?>
                </span>
            </td>
            <td><?= $service->getName() ?></td>
            <td><?= $service->getUrl() ?></td>
            <td><?= $service->getPriority() ?></td>
            <td class="action">
                <a class="button" href="<?= @$data['base_path']; ?>/backend/deleteService?id=<?= $service->getId() ?>">Delete</a>
            </td>
        </tr>
    <?php endforeach; ?>
    </tbody>
</table>

<p>
    <span>Page</span>
    <?php for ($i = 0; $i < @$data['pages']; $i++): ?>
        <?php if(@$data['page'] != $i): ?>
            <a class="button" href="<?= @$data['base_path']; ?>/backend/services?page=<?= $i ?>"><?= $i + 1 ?></a>
        <?php else: ?>
            <span class="button button-clear"><?= $i + 1 ?></span>
        <?php endif; ?>
    <?php endfor; ?>
</p>

<a href="<?= @$data['base_path']; ?>/backend/logout" class="button">Logout</a>