<a href="<?= @$data['base_path']; ?>/backend" class="button">Users</a>
<a href="<?= @$data['base_path']; ?>/backend/services" class="button">Services</a>

<table>
    <thead>
    <tr>
        <td>Username</td>
        <td>eMail</td>
        <td>Hits</td>
        <td>Last Login</td>
        <td>Created at</td>
        <td></td>
    </tr>
    </thead>
    <tbody>
    <?php /** @var \Golli\Models\User $user */ foreach (@$data['users'] as $user): ?>
        <tr>
            <td><a href="<?= @$data['base_path']; ?>/<?= $user->getUsername() ?>"><?= $user->getUsername() ?></a></td>
            <td><?= $user->getEmail() ?></td>
            <td><?= $user->getHits() ?></td>
            <td><?= $user->getLastLogin() ?></td>
            <td><?= $user->getCreated() ?></td>
            <td class="action">
                <a class="button" href="<?= @$data['base_path']; ?>/backend/deleteUser?id=<?= $user->getId() ?>">Delete</a>
            </td>
        </tr>
    <?php endforeach; ?>
    </tbody>
</table>

<p>
    <span>Page</span>
    <?php for ($i = 0; $i < @$data['pages']; $i++): ?>
        <?php if(@$data['page'] != $i): ?>
            <a class="button" href="<?= @$data['base_path']; ?>/backend/?page=<?= $i ?>"><?= $i + 1 ?></a>
        <?php else: ?>
            <span class="button button-clear"><?= $i + 1 ?></span>
        <?php endif; ?>
    <?php endfor; ?>
</p>

<a href="<?= @$data['base_path']; ?>/backend/logout" class="button">Logout</a>